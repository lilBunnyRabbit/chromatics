export type MatrixLike = Array<Array<number>>;

export class Matrix extends Array<Array<number>> {
  public dot(vector: Vector | VectorLike, result = Vector.empty(this.length)): Vector {
    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < vector.length; j++) {
        result[i] += vector[j] * this[i][j];
      }
    }

    return result;
  }
}

export type VectorLike = Array<number>;

export class Vector extends Array<number> {
  static empty(length: number) {
    return new Vector(length).fill(0);
  }

  public dot(matrix: Matrix | MatrixLike) {
    const result = Vector.empty(this.length);

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < this.length; j++) {
        result[i] += this[j] * matrix[i][j];
      }
    }

    return result;
  }

  public sum(vector: Vector | VectorLike) {
    for (let i = 0; i < this.length; i++) {
      this[i] += vector[i] ?? 0;
    }

    return this;
  }
}
