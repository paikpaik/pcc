---
name: python-patterns
description: Pythonic idioms — type hints, error handling, context managers, comprehensions/generators, decorators, and concurrency choice. Use when writing or reviewing Python code beyond the basic checklist in rules/python/.
---

# Python Patterns

Idiomatic Python beyond the always-apply checklist in `rules/python/` — this is for
"how" once you already know the style rules.

## When to Use

- Writing new Python code, especially anything past a quick script
- Reviewing Python code for idiomatic structure
- Choosing between threading / multiprocessing / asyncio
- Designing a small package's layout

## Core Principles

### Readability counts

```python
# Good
def get_active_users(users: list[User]) -> list[User]:
    """Return only active users from the provided list."""
    return [user for user in users if user.is_active]

# Bad — clever, not clear
def get_active_users(u):
    return [x for x in u if x.a]
```

### EAFP over LBYL

Python prefers "ask forgiveness" (try/except) over "look before you leap" (checking first) —
it reads cleaner and avoids a race between the check and the use.

```python
# Good — EAFP
def get_value(d: dict, key: str, default=None):
    try:
        return d[key]
    except KeyError:
        return default

# Not wrong, just less idiomatic here
def get_value(d: dict, key: str, default=None):
    return d[key] if key in d else default
```

## Type Hints

```python
# Python 3.9+: built-in generics, no typing.List/Dict needed
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

T = TypeVar("T")
def first(items: list[T]) -> T | None:
    return items[0] if items else None
```

**Protocol-based duck typing** — type by capability, not by inheritance:

```python
from typing import Protocol

class Renderable(Protocol):
    def render(self) -> str: ...

def render_all(items: list[Renderable]) -> str:
    return "\n".join(item.render() for item in items)
```

## Error Handling

**Exception chaining** — preserve the original traceback when re-raising as a different type:

```python
def process_data(data: str) -> Result:
    try:
        parsed = json.loads(data)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse data: {data}") from e
```

**Custom exception hierarchy** — lets callers catch broadly (`AppError`) or specifically:

```python
class AppError(Exception):
    """Base for all application errors."""

class ValidationError(AppError):
    """Input validation failed."""

class NotFoundError(AppError):
    """Requested resource doesn't exist."""

def get_user(user_id: str) -> User:
    user = db.find_user(user_id)
    if not user:
        raise NotFoundError(f"User not found: {user_id}")
    return user
```

## Context Managers

Beyond `with open(...)`, write your own when a resource needs guaranteed cleanup:

```python
from contextlib import contextmanager

@contextmanager
def timer(name: str):
    start = time.perf_counter()
    yield
    print(f"{name} took {time.perf_counter() - start:.4f}s")

with timer("data processing"):
    process_large_dataset()
```

Class-based, when you need more state than a generator can hold cleanly:

```python
class DatabaseTransaction:
    def __init__(self, connection):
        self.connection = connection

    def __enter__(self):
        self.connection.begin_transaction()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        (self.connection.rollback if exc_type else self.connection.commit)()
        return False  # never suppress the exception
```

## Comprehensions & Generators

```python
# Good — simple transform
names = [user.name for user in users if user.is_active]

# Bad — too many conditions crammed into one line, expand to a loop/function instead
result = [x * 2 for x in items if x > 0 if x % 2 == 0]
```

Prefer a generator expression over a list comprehension when you're only iterating once —
it avoids building the whole thing in memory:

```python
# Good — lazy, O(1) memory
total = sum(x * x for x in range(1_000_000))

# Wasteful — builds the full list just to sum it
total = sum([x * x for x in range(1_000_000)])
```

## Decorators

```python
import functools

def timer(func):
    @functools.wraps(func)  # preserves func.__name__, docstring — don't skip this
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function(): ...
```

Parameterized (a decorator factory — one more nesting level):

```python
def repeat(times: int):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return [func(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator

@repeat(times=3)
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

## Concurrency — Pick the Right Tool

| Workload | Tool |
|---|---|
| I/O-bound (network calls, disk) | `threading` / `concurrent.futures.ThreadPoolExecutor` |
| CPU-bound (heavy computation) | `multiprocessing` / `ProcessPoolExecutor` |
| Concurrent I/O, whole call stack can be async | `asyncio` |

Threading doesn't speed up CPU-bound work in CPython (the GIL) — that's what multiprocessing
is for. Don't reach for asyncio unless the libraries you're calling actually support it end
to end; mixing sync blocking calls into an async function blocks the whole event loop.

```python
async def fetch_all(urls: list[str]) -> dict[str, str]:
    async def fetch(url: str) -> str:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.text()

    results = await asyncio.gather(*(fetch(u) for u in urls), return_exceptions=True)
    return dict(zip(urls, results))
```

## Package Layout

```
myproject/
├── src/
│   └── mypackage/
│       ├── __init__.py
│       ├── main.py
│       ├── api/
│       └── models/
├── tests/
│   ├── conftest.py
│   └── test_*.py
├── pyproject.toml
```

Import order: stdlib, then third-party, then local — `isort` enforces this automatically.

## Performance

```python
# __slots__ trades flexibility for memory — worth it for classes you instantiate a lot
class Point:
    __slots__ = ["x", "y"]
    def __init__(self, x: float, y: float):
        self.x, self.y = x, y
```

```python
# Bad — O(n²), strings are immutable so += rebuilds the string each time
result = ""
for item in items:
    result += str(item)

# Good — O(n)
result = "".join(str(item) for item in items)
```

## Anti-Patterns

```python
# Bad — fragile type check
if type(obj) == list:
    process(obj)

# Good — respects subclasses
if isinstance(obj, list):
    process(obj)
```

```python
# Bad — == on None can be overridden by a custom __eq__
if value == None:
    process()

# Good
if value is None:
    process()
```

```python
# Bad — pollutes the namespace, unclear where names came from
from os.path import *

# Good
from os.path import join, exists
```

## Related

`rules/python/coding-style.md`, `security.md`, `testing.md` cover the always-apply checklist
(mutable default args, bare `except:`, formatting tools, secrets). This skill is the deeper
reference for idioms that checklist doesn't spell out.
