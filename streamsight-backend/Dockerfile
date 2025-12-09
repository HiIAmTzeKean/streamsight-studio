FROM python:3.13-slim

RUN pip install --upgrade pip && pip install uv

WORKDIR /src

COPY . /src

RUN uv sync

ENV PYTHONPATH=/src

EXPOSE 9000

# Run uvicorn importing the package module directly so Python can resolve it
CMD ["uv", "run", "uvicorn", "streamsight_backend.main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]
