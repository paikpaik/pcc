# Python Coding Style

## Standards

- Follow PEP 8.
- Add type annotations on function signatures (params + return type). Let simple local variables be inferred.

## Immutability

Prefer immutable data structures for value objects:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str
```

## Common Pitfalls

```python
# WRONG: mutable default argument — shared across all calls
def add_item(item, items=[]):
    items.append(item)
    return items

# CORRECT
def add_item(item, items=None):
    items = items if items is not None else []
    items.append(item)
    return items
```

```python
# WRONG: swallows everything, including bugs
try:
    risky()
except:
    pass

# CORRECT: catch what you expect, let the rest surface
try:
    risky()
except ValueError as e:
    logger.error("risky() failed: %s", e)
```

## Formatting

- **black** for formatting, **isort** for import order, **ruff** for linting.

## Debug Output

No stray `print()` left in committed code — use `logging` instead.
