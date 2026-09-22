# Python Testing

## Framework

Use **pytest**.

## Coverage

```bash
pytest --cov=src --cov-report=term-missing
```

## Structure — Arrange/Act/Assert

```python
def test_returns_empty_when_no_items_match():
    # Arrange
    items = [{"active": False}]

    # Act
    result = filter_active(items)

    # Assert
    assert result == []
```

## Organization

Use `pytest.mark` to separate fast unit tests from slower integration tests:

```python
@pytest.mark.unit
def test_calculate_total(): ...

@pytest.mark.integration
def test_database_connection(): ...
```

## What to Cover

- New code paths get a test in the same change that introduces them.
- Prioritize edge cases (empty input, `None`, network failure) over the happy path.
