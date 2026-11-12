"""Strict local input and portable filesystem boundaries."""

import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import tempfile

from jsonschema import Draft202012Validator, ValidationError
from referencing import Registry, Resource


SOURCE = Path(__file__).resolve().parents[1]


class ContractError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise ContractError(message)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"


def digest(value):
    return hashlib.sha256(value).hexdigest()


def pairs(items):
    result = {}
    for key, value in items:
        require(key not in result, f"duplicate-json-key: {key}")
        result[key] = value
    return result


def decode(value):
    return json.loads(value, object_pairs_hook=pairs,
                      parse_constant=lambda x: require(False, f"invalid-json-number: {x}"))


def relative(path, dot=False):
    require(isinstance(path, str) and bool(path), "unsafe-path")
    require(path == "." and dot or (
        not path.startswith("/") and "\\" not in path and
        not any(ord(c) < 32 or ord(c) == 127 for c in path) and
        all(p not in ("", ".", "..") for p in path.split("/")) and
        not any(p.casefold() == ".git" or ":" in p for p in path.split("/"))),
        f"unsafe-path: {path}")
    return path


def checked(root, name):
    relative(name, dot=True)
    root = Path(root)
    require(root.is_dir() and not root.is_symlink(), "unsafe-root")
    current = root
    for part in PurePosixPath(name).parts:
        if current.is_dir():
            aliases = [p.name for p in current.iterdir()
                       if p.name.casefold() == part.casefold() and p.name != part]
            require(not aliases, f"path-collision: {name}")
        current = current / part
        require(not current.is_symlink(), f"symlink-collision: {name}")
        if current.exists() and current != root / name:
            require(current.is_dir(), f"parent-not-directory: {name}")
    return current


def snapshot(root, name):
    path = checked(root, name)
    if not path.exists():
        return {"kind": "absent"}
    mode = stat.S_IMODE(path.stat().st_mode)
    if path.is_dir():
        return {"kind": "directory", "mode": mode}
    require(path.is_file(), f"unsupported-file: {name}")
    return {"kind": "file", "sha256": digest(path.read_bytes()), "mode": mode}


class Inputs:
    def __init__(self, root):
        self.root = Path(root)
        self.reads = {}

    def track(self, name):
        path = PurePosixPath(relative(name, dot=True))
        for parent in reversed(path.parents):
            key = str(parent)
            self.reads[key] = snapshot(self.root, key)
        self.reads[name] = snapshot(self.root, name)
        return checked(self.root, name)

    def text(self, name):
        path = self.track(name)
        require(path.is_file(), f"missing-file: {name}")
        return path.read_bytes().decode("utf-8")

    def json(self, name):
        return decode(self.text(name))


def validate(source, name, value):
    schemas = [source.json("schemas/" + n + ".schema.json")
               for n in ("common", name)]
    registry = Registry().with_resources((s["$id"], Resource.from_contents(s)) for s in schemas)
    try:
        Draft202012Validator(schemas[-1], registry=registry).validate(value)
    except ValidationError as error:
        location = ".".join(str(p) for p in error.absolute_path)
        raise ContractError(f"schema-validation: {name}.{location}: {error.message[:240]}") from error


def atomic(path, data, mode=0o644):
    """One-file replacement; callers retain before-images for multi-file failure."""
    path = Path(path)
    fd, temporary = tempfile.mkstemp(prefix=".repo-workflow-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def source_commit():
    """Read checkout identity without executing Git or any project command."""
    git = SOURCE / ".git"
    if git.is_file():
        git = (SOURCE / git.read_text().strip().removeprefix("gitdir: ")).resolve()
    head = (git / "HEAD").read_text().strip()
    if head.startswith("ref: "):
        ref = head[5:]
        if (git / ref).is_file():
            head = (git / ref).read_text().strip()
        else:
            head = next((line.split()[0] for line in (git / "packed-refs").read_text().splitlines()
                         if line.endswith(" " + ref)), "")
    require(len(head) == 40 and all(c in "0123456789abcdef" for c in head), "unresolved-source-commit")
    return head
