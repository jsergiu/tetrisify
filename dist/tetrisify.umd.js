(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.tetrisify = factory());
}(this, function () { 'use strict';

  const toString = Object.prototype.toString;

  function isAnyArray(object) {
    return toString.call(object).endsWith('Array]');
  }

  var src = isAnyArray;

  /**
   * Computes the maximum of the given values
   * @param {Array<number>} input
   * @return {number}
   */

  function max(input) {
    if (!src(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var max = input[0];

    for (var i = 1; i < input.length; i++) {
      if (input[i] > max) max = input[i];
    }

    return max;
  }

  /**
   * Computes the minimum of the given values
   * @param {Array<number>} input
   * @return {number}
   */

  function min(input) {
    if (!src(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var min = input[0];

    for (var i = 1; i < input.length; i++) {
      if (input[i] < min) min = input[i];
    }

    return min;
  }

  function rescale(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!src(input)) {
      throw new TypeError('input must be an array');
    } else if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var output;

    if (options.output !== undefined) {
      if (!src(options.output)) {
        throw new TypeError('output option must be an array if specified');
      }

      output = options.output;
    } else {
      output = new Array(input.length);
    }

    var currentMin = min(input);
    var currentMax = max(input);

    if (currentMin === currentMax) {
      throw new RangeError('minimum and maximum input values are equal. Cannot rescale a constant array');
    }

    var _options$min = options.min,
        minValue = _options$min === void 0 ? options.autoMinMax ? currentMin : 0 : _options$min,
        _options$max = options.max,
        maxValue = _options$max === void 0 ? options.autoMinMax ? currentMax : 1 : _options$max;

    if (minValue >= maxValue) {
      throw new RangeError('min option must be smaller than max option');
    }

    var factor = (maxValue - minValue) / (currentMax - currentMin);

    for (var i = 0; i < input.length; i++) {
      output[i] = (input[i] - currentMin) * factor + minValue;
    }

    return output;
  }

  /**
   * @class LuDecomposition
   * @link https://github.com/lutzroeder/Mapack/blob/master/Source/LuDecomposition.cs
   * @param {Matrix} matrix
   */
  class LuDecomposition {
    constructor(matrix) {
      matrix = WrapperMatrix2D.checkMatrix(matrix);

      var lu = matrix.clone();
      var rows = lu.rows;
      var columns = lu.columns;
      var pivotVector = new Array(rows);
      var pivotSign = 1;
      var i, j, k, p, s, t, v;
      var LUcolj, kmax;

      for (i = 0; i < rows; i++) {
        pivotVector[i] = i;
      }

      LUcolj = new Array(rows);

      for (j = 0; j < columns; j++) {
        for (i = 0; i < rows; i++) {
          LUcolj[i] = lu.get(i, j);
        }

        for (i = 0; i < rows; i++) {
          kmax = Math.min(i, j);
          s = 0;
          for (k = 0; k < kmax; k++) {
            s += lu.get(i, k) * LUcolj[k];
          }
          LUcolj[i] -= s;
          lu.set(i, j, LUcolj[i]);
        }

        p = j;
        for (i = j + 1; i < rows; i++) {
          if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
            p = i;
          }
        }

        if (p !== j) {
          for (k = 0; k < columns; k++) {
            t = lu.get(p, k);
            lu.set(p, k, lu.get(j, k));
            lu.set(j, k, t);
          }

          v = pivotVector[p];
          pivotVector[p] = pivotVector[j];
          pivotVector[j] = v;

          pivotSign = -pivotSign;
        }

        if (j < rows && lu.get(j, j) !== 0) {
          for (i = j + 1; i < rows; i++) {
            lu.set(i, j, lu.get(i, j) / lu.get(j, j));
          }
        }
      }

      this.LU = lu;
      this.pivotVector = pivotVector;
      this.pivotSign = pivotSign;
    }

    /**
     *
     * @return {boolean}
     */
    isSingular() {
      var data = this.LU;
      var col = data.columns;
      for (var j = 0; j < col; j++) {
        if (data[j][j] === 0) {
          return true;
        }
      }
      return false;
    }

    /**
     *
     * @param {Matrix} value
     * @return {Matrix}
     */
    solve(value) {
      value = Matrix.checkMatrix(value);

      var lu = this.LU;
      var rows = lu.rows;

      if (rows !== value.rows) {
        throw new Error('Invalid matrix dimensions');
      }
      if (this.isSingular()) {
        throw new Error('LU matrix is singular');
      }

      var count = value.columns;
      var X = value.subMatrixRow(this.pivotVector, 0, count - 1);
      var columns = lu.columns;
      var i, j, k;

      for (k = 0; k < columns; k++) {
        for (i = k + 1; i < columns; i++) {
          for (j = 0; j < count; j++) {
            X[i][j] -= X[k][j] * lu[i][k];
          }
        }
      }
      for (k = columns - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X[k][j] /= lu[k][k];
        }
        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X[i][j] -= X[k][j] * lu[i][k];
          }
        }
      }
      return X;
    }

    /**
     *
     * @return {number}
     */
    get determinant() {
      var data = this.LU;
      if (!data.isSquare()) {
        throw new Error('Matrix must be square');
      }
      var determinant = this.pivotSign;
      var col = data.columns;
      for (var j = 0; j < col; j++) {
        determinant *= data[j][j];
      }
      return determinant;
    }

    /**
     *
     * @return {Matrix}
     */
    get lowerTriangularMatrix() {
      var data = this.LU;
      var rows = data.rows;
      var columns = data.columns;
      var X = new Matrix(rows, columns);
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          if (i > j) {
            X[i][j] = data[i][j];
          } else if (i === j) {
            X[i][j] = 1;
          } else {
            X[i][j] = 0;
          }
        }
      }
      return X;
    }

    /**
     *
     * @return {Matrix}
     */
    get upperTriangularMatrix() {
      var data = this.LU;
      var rows = data.rows;
      var columns = data.columns;
      var X = new Matrix(rows, columns);
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          if (i <= j) {
            X[i][j] = data[i][j];
          } else {
            X[i][j] = 0;
          }
        }
      }
      return X;
    }

    /**
     *
     * @return {Array<number>}
     */
    get pivotPermutationVector() {
      return this.pivotVector.slice();
    }
  }

  function hypotenuse(a, b) {
    var r = 0;
    if (Math.abs(a) > Math.abs(b)) {
      r = b / a;
      return Math.abs(a) * Math.sqrt(1 + r * r);
    }
    if (b !== 0) {
      r = a / b;
      return Math.abs(b) * Math.sqrt(1 + r * r);
    }
    return 0;
  }

  function getFilled2DArray(rows, columns, value) {
    var array = new Array(rows);
    for (var i = 0; i < rows; i++) {
      array[i] = new Array(columns);
      for (var j = 0; j < columns; j++) {
        array[i][j] = value;
      }
    }
    return array;
  }

  /**
   * @class SingularValueDecomposition
   * @see https://github.com/accord-net/framework/blob/development/Sources/Accord.Math/Decompositions/SingularValueDecomposition.cs
   * @param {Matrix} value
   * @param {object} [options]
   * @param {boolean} [options.computeLeftSingularVectors=true]
   * @param {boolean} [options.computeRightSingularVectors=true]
   * @param {boolean} [options.autoTranspose=false]
   */
  class SingularValueDecomposition {
    constructor(value, options = {}) {
      value = WrapperMatrix2D.checkMatrix(value);

      var m = value.rows;
      var n = value.columns;

      const {
        computeLeftSingularVectors = true,
        computeRightSingularVectors = true,
        autoTranspose = false
      } = options;

      var wantu = Boolean(computeLeftSingularVectors);
      var wantv = Boolean(computeRightSingularVectors);

      var swapped = false;
      var a;
      if (m < n) {
        if (!autoTranspose) {
          a = value.clone();
          // eslint-disable-next-line no-console
          console.warn(
            'Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose'
          );
        } else {
          a = value.transpose();
          m = a.rows;
          n = a.columns;
          swapped = true;
          var aux = wantu;
          wantu = wantv;
          wantv = aux;
        }
      } else {
        a = value.clone();
      }

      var nu = Math.min(m, n);
      var ni = Math.min(m + 1, n);
      var s = new Array(ni);
      var U = getFilled2DArray(m, nu, 0);
      var V = getFilled2DArray(n, n, 0);

      var e = new Array(n);
      var work = new Array(m);

      var si = new Array(ni);
      for (let i = 0; i < ni; i++) si[i] = i;

      var nct = Math.min(m - 1, n);
      var nrt = Math.max(0, Math.min(n - 2, m));
      var mrc = Math.max(nct, nrt);

      for (let k = 0; k < mrc; k++) {
        if (k < nct) {
          s[k] = 0;
          for (let i = k; i < m; i++) {
            s[k] = hypotenuse(s[k], a[i][k]);
          }
          if (s[k] !== 0) {
            if (a[k][k] < 0) {
              s[k] = -s[k];
            }
            for (let i = k; i < m; i++) {
              a[i][k] /= s[k];
            }
            a[k][k] += 1;
          }
          s[k] = -s[k];
        }

        for (let j = k + 1; j < n; j++) {
          if (k < nct && s[k] !== 0) {
            let t = 0;
            for (let i = k; i < m; i++) {
              t += a[i][k] * a[i][j];
            }
            t = -t / a[k][k];
            for (let i = k; i < m; i++) {
              a[i][j] += t * a[i][k];
            }
          }
          e[j] = a[k][j];
        }

        if (wantu && k < nct) {
          for (let i = k; i < m; i++) {
            U[i][k] = a[i][k];
          }
        }

        if (k < nrt) {
          e[k] = 0;
          for (let i = k + 1; i < n; i++) {
            e[k] = hypotenuse(e[k], e[i]);
          }
          if (e[k] !== 0) {
            if (e[k + 1] < 0) {
              e[k] = 0 - e[k];
            }
            for (let i = k + 1; i < n; i++) {
              e[i] /= e[k];
            }
            e[k + 1] += 1;
          }
          e[k] = -e[k];
          if (k + 1 < m && e[k] !== 0) {
            for (let i = k + 1; i < m; i++) {
              work[i] = 0;
            }
            for (let i = k + 1; i < m; i++) {
              for (let j = k + 1; j < n; j++) {
                work[i] += e[j] * a[i][j];
              }
            }
            for (let j = k + 1; j < n; j++) {
              let t = -e[j] / e[k + 1];
              for (let i = k + 1; i < m; i++) {
                a[i][j] += t * work[i];
              }
            }
          }
          if (wantv) {
            for (let i = k + 1; i < n; i++) {
              V[i][k] = e[i];
            }
          }
        }
      }

      let p = Math.min(n, m + 1);
      if (nct < n) {
        s[nct] = a[nct][nct];
      }
      if (m < p) {
        s[p - 1] = 0;
      }
      if (nrt + 1 < p) {
        e[nrt] = a[nrt][p - 1];
      }
      e[p - 1] = 0;

      if (wantu) {
        for (let j = nct; j < nu; j++) {
          for (let i = 0; i < m; i++) {
            U[i][j] = 0;
          }
          U[j][j] = 1;
        }
        for (let k = nct - 1; k >= 0; k--) {
          if (s[k] !== 0) {
            for (let j = k + 1; j < nu; j++) {
              let t = 0;
              for (let i = k; i < m; i++) {
                t += U[i][k] * U[i][j];
              }
              t = -t / U[k][k];
              for (let i = k; i < m; i++) {
                U[i][j] += t * U[i][k];
              }
            }
            for (let i = k; i < m; i++) {
              U[i][k] = -U[i][k];
            }
            U[k][k] = 1 + U[k][k];
            for (let i = 0; i < k - 1; i++) {
              U[i][k] = 0;
            }
          } else {
            for (let i = 0; i < m; i++) {
              U[i][k] = 0;
            }
            U[k][k] = 1;
          }
        }
      }

      if (wantv) {
        for (let k = n - 1; k >= 0; k--) {
          if (k < nrt && e[k] !== 0) {
            for (let j = k + 1; j < n; j++) {
              let t = 0;
              for (let i = k + 1; i < n; i++) {
                t += V[i][k] * V[i][j];
              }
              t = -t / V[k + 1][k];
              for (let i = k + 1; i < n; i++) {
                V[i][j] += t * V[i][k];
              }
            }
          }
          for (let i = 0; i < n; i++) {
            V[i][k] = 0;
          }
          V[k][k] = 1;
        }
      }

      var pp = p - 1;
      var eps = Number.EPSILON;
      while (p > 0) {
        let k, kase;
        for (k = p - 2; k >= -1; k--) {
          if (k === -1) {
            break;
          }
          const alpha =
            Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
          if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
            e[k] = 0;
            break;
          }
        }
        if (k === p - 2) {
          kase = 4;
        } else {
          let ks;
          for (ks = p - 1; ks >= k; ks--) {
            if (ks === k) {
              break;
            }
            let t =
              (ks !== p ? Math.abs(e[ks]) : 0) +
              (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
            if (Math.abs(s[ks]) <= eps * t) {
              s[ks] = 0;
              break;
            }
          }
          if (ks === k) {
            kase = 3;
          } else if (ks === p - 1) {
            kase = 1;
          } else {
            kase = 2;
            k = ks;
          }
        }

        k++;

        switch (kase) {
          case 1: {
            let f = e[p - 2];
            e[p - 2] = 0;
            for (let j = p - 2; j >= k; j--) {
              let t = hypotenuse(s[j], f);
              let cs = s[j] / t;
              let sn = f / t;
              s[j] = t;
              if (j !== k) {
                f = -sn * e[j - 1];
                e[j - 1] = cs * e[j - 1];
              }
              if (wantv) {
                for (let i = 0; i < n; i++) {
                  t = cs * V[i][j] + sn * V[i][p - 1];
                  V[i][p - 1] = -sn * V[i][j] + cs * V[i][p - 1];
                  V[i][j] = t;
                }
              }
            }
            break;
          }
          case 2: {
            let f = e[k - 1];
            e[k - 1] = 0;
            for (let j = k; j < p; j++) {
              let t = hypotenuse(s[j], f);
              let cs = s[j] / t;
              let sn = f / t;
              s[j] = t;
              f = -sn * e[j];
              e[j] = cs * e[j];
              if (wantu) {
                for (let i = 0; i < m; i++) {
                  t = cs * U[i][j] + sn * U[i][k - 1];
                  U[i][k - 1] = -sn * U[i][j] + cs * U[i][k - 1];
                  U[i][j] = t;
                }
              }
            }
            break;
          }
          case 3: {
            const scale = Math.max(
              Math.abs(s[p - 1]),
              Math.abs(s[p - 2]),
              Math.abs(e[p - 2]),
              Math.abs(s[k]),
              Math.abs(e[k])
            );
            const sp = s[p - 1] / scale;
            const spm1 = s[p - 2] / scale;
            const epm1 = e[p - 2] / scale;
            const sk = s[k] / scale;
            const ek = e[k] / scale;
            const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
            const c = sp * epm1 * (sp * epm1);
            let shift = 0;
            if (b !== 0 || c !== 0) {
              if (b < 0) {
                shift = 0 - Math.sqrt(b * b + c);
              } else {
                shift = Math.sqrt(b * b + c);
              }
              shift = c / (b + shift);
            }
            let f = (sk + sp) * (sk - sp) + shift;
            let g = sk * ek;
            for (let j = k; j < p - 1; j++) {
              let t = hypotenuse(f, g);
              if (t === 0) t = Number.MIN_VALUE;
              let cs = f / t;
              let sn = g / t;
              if (j !== k) {
                e[j - 1] = t;
              }
              f = cs * s[j] + sn * e[j];
              e[j] = cs * e[j] - sn * s[j];
              g = sn * s[j + 1];
              s[j + 1] = cs * s[j + 1];
              if (wantv) {
                for (let i = 0; i < n; i++) {
                  t = cs * V[i][j] + sn * V[i][j + 1];
                  V[i][j + 1] = -sn * V[i][j] + cs * V[i][j + 1];
                  V[i][j] = t;
                }
              }
              t = hypotenuse(f, g);
              if (t === 0) t = Number.MIN_VALUE;
              cs = f / t;
              sn = g / t;
              s[j] = t;
              f = cs * e[j] + sn * s[j + 1];
              s[j + 1] = -sn * e[j] + cs * s[j + 1];
              g = sn * e[j + 1];
              e[j + 1] = cs * e[j + 1];
              if (wantu && j < m - 1) {
                for (let i = 0; i < m; i++) {
                  t = cs * U[i][j] + sn * U[i][j + 1];
                  U[i][j + 1] = -sn * U[i][j] + cs * U[i][j + 1];
                  U[i][j] = t;
                }
              }
            }
            e[p - 2] = f;
            break;
          }
          case 4: {
            if (s[k] <= 0) {
              s[k] = s[k] < 0 ? -s[k] : 0;
              if (wantv) {
                for (let i = 0; i <= pp; i++) {
                  V[i][k] = -V[i][k];
                }
              }
            }
            while (k < pp) {
              if (s[k] >= s[k + 1]) {
                break;
              }
              let t = s[k];
              s[k] = s[k + 1];
              s[k + 1] = t;
              if (wantv && k < n - 1) {
                for (let i = 0; i < n; i++) {
                  t = V[i][k + 1];
                  V[i][k + 1] = V[i][k];
                  V[i][k] = t;
                }
              }
              if (wantu && k < m - 1) {
                for (let i = 0; i < m; i++) {
                  t = U[i][k + 1];
                  U[i][k + 1] = U[i][k];
                  U[i][k] = t;
                }
              }
              k++;
            }
            p--;
            break;
          }
          // no default
        }
      }

      if (swapped) {
        var tmp = V;
        V = U;
        U = tmp;
      }

      this.m = m;
      this.n = n;
      this.s = s;
      this.U = U;
      this.V = V;
    }

    /**
     * Solve a problem of least square (Ax=b) by using the SVD. Useful when A is singular. When A is not singular, it would be better to use qr.solve(value).
     * Example : We search to approximate x, with A matrix shape m*n, x vector size n, b vector size m (m > n). We will use :
     * var svd = SingularValueDecomposition(A);
     * var x = svd.solve(b);
     * @param {Matrix} value - Matrix 1D which is the vector b (in the equation Ax = b)
     * @return {Matrix} - The vector x
     */
    solve(value) {
      var Y = value;
      var e = this.threshold;
      var scols = this.s.length;
      var Ls = Matrix.zeros(scols, scols);

      for (let i = 0; i < scols; i++) {
        if (Math.abs(this.s[i]) <= e) {
          Ls[i][i] = 0;
        } else {
          Ls[i][i] = 1 / this.s[i];
        }
      }

      var U = this.U;
      var V = this.rightSingularVectors;

      var VL = V.mmul(Ls);
      var vrows = V.rows;
      var urows = U.length;
      var VLU = Matrix.zeros(vrows, urows);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;
          for (let k = 0; k < scols; k++) {
            sum += VL[i][k] * U[j][k];
          }
          VLU[i][j] = sum;
        }
      }

      return VLU.mmul(Y);
    }

    /**
     *
     * @param {Array<number>} value
     * @return {Matrix}
     */
    solveForDiagonal(value) {
      return this.solve(Matrix.diag(value));
    }

    /**
     * Get the inverse of the matrix. We compute the inverse of a matrix using SVD when this matrix is singular or ill-conditioned. Example :
     * var svd = SingularValueDecomposition(A);
     * var inverseA = svd.inverse();
     * @return {Matrix} - The approximation of the inverse of the matrix
     */
    inverse() {
      var V = this.V;
      var e = this.threshold;
      var vrows = V.length;
      var vcols = V[0].length;
      var X = new Matrix(vrows, this.s.length);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < vcols; j++) {
          if (Math.abs(this.s[j]) > e) {
            X[i][j] = V[i][j] / this.s[j];
          } else {
            X[i][j] = 0;
          }
        }
      }

      var U = this.U;

      var urows = U.length;
      var ucols = U[0].length;
      var Y = new Matrix(vrows, urows);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;
          for (let k = 0; k < ucols; k++) {
            sum += X[i][k] * U[j][k];
          }
          Y[i][j] = sum;
        }
      }

      return Y;
    }

    /**
     *
     * @return {number}
     */
    get condition() {
      return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    }

    /**
     *
     * @return {number}
     */
    get norm2() {
      return this.s[0];
    }

    /**
     *
     * @return {number}
     */
    get rank() {
      var tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
      var r = 0;
      var s = this.s;
      for (var i = 0, ii = s.length; i < ii; i++) {
        if (s[i] > tol) {
          r++;
        }
      }
      return r;
    }

    /**
     *
     * @return {Array<number>}
     */
    get diagonal() {
      return this.s;
    }

    /**
     *
     * @return {number}
     */
    get threshold() {
      return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
    }

    /**
     *
     * @return {Matrix}
     */
    get leftSingularVectors() {
      if (!Matrix.isMatrix(this.U)) {
        this.U = new Matrix(this.U);
      }
      return this.U;
    }

    /**
     *
     * @return {Matrix}
     */
    get rightSingularVectors() {
      if (!Matrix.isMatrix(this.V)) {
        this.V = new Matrix(this.V);
      }
      return this.V;
    }

    /**
     *
     * @return {Matrix}
     */
    get diagonalMatrix() {
      return Matrix.diag(this.s);
    }
  }

  /**
   * @private
   * Check that a row index is not out of bounds
   * @param {Matrix} matrix
   * @param {number} index
   * @param {boolean} [outer]
   */
  function checkRowIndex(matrix, index, outer) {
    var max = outer ? matrix.rows : matrix.rows - 1;
    if (index < 0 || index > max) {
      throw new RangeError('Row index out of range');
    }
  }

  /**
   * @private
   * Check that a column index is not out of bounds
   * @param {Matrix} matrix
   * @param {number} index
   * @param {boolean} [outer]
   */
  function checkColumnIndex(matrix, index, outer) {
    var max = outer ? matrix.columns : matrix.columns - 1;
    if (index < 0 || index > max) {
      throw new RangeError('Column index out of range');
    }
  }

  /**
   * @private
   * Check that the provided vector is an array with the right length
   * @param {Matrix} matrix
   * @param {Array|Matrix} vector
   * @return {Array}
   * @throws {RangeError}
   */
  function checkRowVector(matrix, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }
    if (vector.length !== matrix.columns) {
      throw new RangeError(
        'vector size must be the same as the number of columns'
      );
    }
    return vector;
  }

  /**
   * @private
   * Check that the provided vector is an array with the right length
   * @param {Matrix} matrix
   * @param {Array|Matrix} vector
   * @return {Array}
   * @throws {RangeError}
   */
  function checkColumnVector(matrix, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }
    if (vector.length !== matrix.rows) {
      throw new RangeError('vector size must be the same as the number of rows');
    }
    return vector;
  }

  function checkIndices(matrix, rowIndices, columnIndices) {
    return {
      row: checkRowIndices(matrix, rowIndices),
      column: checkColumnIndices(matrix, columnIndices)
    };
  }

  function checkRowIndices(matrix, rowIndices) {
    if (typeof rowIndices !== 'object') {
      throw new TypeError('unexpected type for row indices');
    }

    var rowOut = rowIndices.some((r) => {
      return r < 0 || r >= matrix.rows;
    });

    if (rowOut) {
      throw new RangeError('row indices are out of range');
    }

    if (!Array.isArray(rowIndices)) rowIndices = Array.from(rowIndices);

    return rowIndices;
  }

  function checkColumnIndices(matrix, columnIndices) {
    if (typeof columnIndices !== 'object') {
      throw new TypeError('unexpected type for column indices');
    }

    var columnOut = columnIndices.some((c) => {
      return c < 0 || c >= matrix.columns;
    });

    if (columnOut) {
      throw new RangeError('column indices are out of range');
    }
    if (!Array.isArray(columnIndices)) columnIndices = Array.from(columnIndices);

    return columnIndices;
  }

  function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
    if (arguments.length !== 5) {
      throw new RangeError('expected 4 arguments');
    }
    checkNumber('startRow', startRow);
    checkNumber('endRow', endRow);
    checkNumber('startColumn', startColumn);
    checkNumber('endColumn', endColumn);
    if (
      startRow > endRow ||
      startColumn > endColumn ||
      startRow < 0 ||
      startRow >= matrix.rows ||
      endRow < 0 ||
      endRow >= matrix.rows ||
      startColumn < 0 ||
      startColumn >= matrix.columns ||
      endColumn < 0 ||
      endColumn >= matrix.columns
    ) {
      throw new RangeError('Submatrix indices are out of range');
    }
  }

  function sumByRow(matrix) {
    var sum = Matrix.zeros(matrix.rows, 1);
    for (var i = 0; i < matrix.rows; ++i) {
      for (var j = 0; j < matrix.columns; ++j) {
        sum.set(i, 0, sum.get(i, 0) + matrix.get(i, j));
      }
    }
    return sum;
  }

  function sumByColumn(matrix) {
    var sum = Matrix.zeros(1, matrix.columns);
    for (var i = 0; i < matrix.rows; ++i) {
      for (var j = 0; j < matrix.columns; ++j) {
        sum.set(0, j, sum.get(0, j) + matrix.get(i, j));
      }
    }
    return sum;
  }

  function sumAll(matrix) {
    var v = 0;
    for (var i = 0; i < matrix.rows; i++) {
      for (var j = 0; j < matrix.columns; j++) {
        v += matrix.get(i, j);
      }
    }
    return v;
  }

  function checkNumber(name, value) {
    if (typeof value !== 'number') {
      throw new TypeError(`${name} must be a number`);
    }
  }

  class BaseView extends AbstractMatrix() {
    constructor(matrix, rows, columns) {
      super();
      this.matrix = matrix;
      this.rows = rows;
      this.columns = columns;
    }

    static get [Symbol.species]() {
      return Matrix;
    }
  }

  class MatrixTransposeView extends BaseView {
    constructor(matrix) {
      super(matrix, matrix.columns, matrix.rows);
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(columnIndex, rowIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(columnIndex, rowIndex);
    }
  }

  class MatrixRowView extends BaseView {
    constructor(matrix, row) {
      super(matrix, 1, matrix.columns);
      this.row = row;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.row, columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.row, columnIndex);
    }
  }

  class MatrixSubView extends BaseView {
    constructor(matrix, startRow, endRow, startColumn, endColumn) {
      checkRange(matrix, startRow, endRow, startColumn, endColumn);
      super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
      this.startRow = startRow;
      this.startColumn = startColumn;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(
        this.startRow + rowIndex,
        this.startColumn + columnIndex,
        value
      );
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(
        this.startRow + rowIndex,
        this.startColumn + columnIndex
      );
    }
  }

  class MatrixSelectionView extends BaseView {
    constructor(matrix, rowIndices, columnIndices) {
      var indices = checkIndices(matrix, rowIndices, columnIndices);
      super(matrix, indices.row.length, indices.column.length);
      this.rowIndices = indices.row;
      this.columnIndices = indices.column;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(
        this.rowIndices[rowIndex],
        this.columnIndices[columnIndex],
        value
      );
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(
        this.rowIndices[rowIndex],
        this.columnIndices[columnIndex]
      );
    }
  }

  class MatrixRowSelectionView extends BaseView {
    constructor(matrix, rowIndices) {
      rowIndices = checkRowIndices(matrix, rowIndices);
      super(matrix, rowIndices.length, matrix.columns);
      this.rowIndices = rowIndices;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
    }
  }

  class MatrixColumnSelectionView extends BaseView {
    constructor(matrix, columnIndices) {
      columnIndices = checkColumnIndices(matrix, columnIndices);
      super(matrix, matrix.rows, columnIndices.length);
      this.columnIndices = columnIndices;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
    }
  }

  class MatrixColumnView extends BaseView {
    constructor(matrix, column) {
      super(matrix, matrix.rows, 1);
      this.column = column;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.column, value);
      return this;
    }

    get(rowIndex) {
      return this.matrix.get(rowIndex, this.column);
    }
  }

  class MatrixFlipRowView extends BaseView {
    constructor(matrix) {
      super(matrix, matrix.rows, matrix.columns);
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
    }
  }

  class MatrixFlipColumnView extends BaseView {
    constructor(matrix) {
      super(matrix, matrix.rows, matrix.columns);
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
    }
  }

  function AbstractMatrix(superCtor) {
    if (superCtor === undefined) superCtor = Object;

    /**
     * Real matrix
     * @class Matrix
     * @param {number|Array|Matrix} nRows - Number of rows of the new matrix,
     * 2D array containing the data or Matrix instance to clone
     * @param {number} [nColumns] - Number of columns of the new matrix
     */
    class Matrix extends superCtor {
      static get [Symbol.species]() {
        return this;
      }

      /**
       * Constructs a Matrix with the chosen dimensions from a 1D array
       * @param {number} newRows - Number of rows
       * @param {number} newColumns - Number of columns
       * @param {Array} newData - A 1D array containing data for the matrix
       * @return {Matrix} - The new matrix
       */
      static from1DArray(newRows, newColumns, newData) {
        var length = newRows * newColumns;
        if (length !== newData.length) {
          throw new RangeError('Data length does not match given dimensions');
        }
        var newMatrix = new this(newRows, newColumns);
        for (var row = 0; row < newRows; row++) {
          for (var column = 0; column < newColumns; column++) {
            newMatrix.set(row, column, newData[row * newColumns + column]);
          }
        }
        return newMatrix;
      }

      /**
           * Creates a row vector, a matrix with only one row.
           * @param {Array} newData - A 1D array containing data for the vector
           * @return {Matrix} - The new matrix
           */
      static rowVector(newData) {
        var vector = new this(1, newData.length);
        for (var i = 0; i < newData.length; i++) {
          vector.set(0, i, newData[i]);
        }
        return vector;
      }

      /**
           * Creates a column vector, a matrix with only one column.
           * @param {Array} newData - A 1D array containing data for the vector
           * @return {Matrix} - The new matrix
           */
      static columnVector(newData) {
        var vector = new this(newData.length, 1);
        for (var i = 0; i < newData.length; i++) {
          vector.set(i, 0, newData[i]);
        }
        return vector;
      }

      /**
           * Creates an empty matrix with the given dimensions. Values will be undefined. Same as using new Matrix(rows, columns).
           * @param {number} rows - Number of rows
           * @param {number} columns - Number of columns
           * @return {Matrix} - The new matrix
           */
      static empty(rows, columns) {
        return new this(rows, columns);
      }

      /**
           * Creates a matrix with the given dimensions. Values will be set to zero.
           * @param {number} rows - Number of rows
           * @param {number} columns - Number of columns
           * @return {Matrix} - The new matrix
           */
      static zeros(rows, columns) {
        return this.empty(rows, columns).fill(0);
      }

      /**
           * Creates a matrix with the given dimensions. Values will be set to one.
           * @param {number} rows - Number of rows
           * @param {number} columns - Number of columns
           * @return {Matrix} - The new matrix
           */
      static ones(rows, columns) {
        return this.empty(rows, columns).fill(1);
      }

      /**
           * Creates a matrix with the given dimensions. Values will be randomly set.
           * @param {number} rows - Number of rows
           * @param {number} columns - Number of columns
           * @param {function} [rng=Math.random] - Random number generator
           * @return {Matrix} The new matrix
           */
      static rand(rows, columns, rng) {
        if (rng === undefined) rng = Math.random;
        var matrix = this.empty(rows, columns);
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            matrix.set(i, j, rng());
          }
        }
        return matrix;
      }

      /**
           * Creates a matrix with the given dimensions. Values will be random integers.
           * @param {number} rows - Number of rows
           * @param {number} columns - Number of columns
           * @param {number} [maxValue=1000] - Maximum value
           * @param {function} [rng=Math.random] - Random number generator
           * @return {Matrix} The new matrix
           */
      static randInt(rows, columns, maxValue, rng) {
        if (maxValue === undefined) maxValue = 1000;
        if (rng === undefined) rng = Math.random;
        var matrix = this.empty(rows, columns);
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            var value = Math.floor(rng() * maxValue);
            matrix.set(i, j, value);
          }
        }
        return matrix;
      }

      /**
           * Creates an identity matrix with the given dimension. Values of the diagonal will be 1 and others will be 0.
           * @param {number} rows - Number of rows
           * @param {number} [columns=rows] - Number of columns
           * @param {number} [value=1] - Value to fill the diagonal with
           * @return {Matrix} - The new identity matrix
           */
      static eye(rows, columns, value) {
        if (columns === undefined) columns = rows;
        if (value === undefined) value = 1;
        var min = Math.min(rows, columns);
        var matrix = this.zeros(rows, columns);
        for (var i = 0; i < min; i++) {
          matrix.set(i, i, value);
        }
        return matrix;
      }

      /**
           * Creates a diagonal matrix based on the given array.
           * @param {Array} data - Array containing the data for the diagonal
           * @param {number} [rows] - Number of rows (Default: data.length)
           * @param {number} [columns] - Number of columns (Default: rows)
           * @return {Matrix} - The new diagonal matrix
           */
      static diag(data, rows, columns) {
        var l = data.length;
        if (rows === undefined) rows = l;
        if (columns === undefined) columns = rows;
        var min = Math.min(l, rows, columns);
        var matrix = this.zeros(rows, columns);
        for (var i = 0; i < min; i++) {
          matrix.set(i, i, data[i]);
        }
        return matrix;
      }

      /**
           * Returns a matrix whose elements are the minimum between matrix1 and matrix2
           * @param {Matrix} matrix1
           * @param {Matrix} matrix2
           * @return {Matrix}
           */
      static min(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        var rows = matrix1.rows;
        var columns = matrix1.columns;
        var result = new this(rows, columns);
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
          }
        }
        return result;
      }

      /**
           * Returns a matrix whose elements are the maximum between matrix1 and matrix2
           * @param {Matrix} matrix1
           * @param {Matrix} matrix2
           * @return {Matrix}
           */
      static max(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        var rows = matrix1.rows;
        var columns = matrix1.columns;
        var result = new this(rows, columns);
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
          }
        }
        return result;
      }

      /**
           * Check that the provided value is a Matrix and tries to instantiate one if not
           * @param {*} value - The value to check
           * @return {Matrix}
           */
      static checkMatrix(value) {
        return Matrix.isMatrix(value) ? value : new this(value);
      }

      /**
           * Returns true if the argument is a Matrix, false otherwise
           * @param {*} value - The value to check
           * @return {boolean}
           */
      static isMatrix(value) {
        return (value != null) && (value.klass === 'Matrix');
      }

      /**
           * @prop {number} size - The number of elements in the matrix.
           */
      get size() {
        return this.rows * this.columns;
      }

      /**
           * Applies a callback for each element of the matrix. The function is called in the matrix (this) context.
           * @param {function} callback - Function that will be called with two parameters : i (row) and j (column)
           * @return {Matrix} this
           */
      apply(callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('callback must be a function');
        }
        var ii = this.rows;
        var jj = this.columns;
        for (var i = 0; i < ii; i++) {
          for (var j = 0; j < jj; j++) {
            callback.call(this, i, j);
          }
        }
        return this;
      }

      /**
           * Returns a new 1D array filled row by row with the matrix values
           * @return {Array}
           */
      to1DArray() {
        var array = new Array(this.size);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            array[i * this.columns + j] = this.get(i, j);
          }
        }
        return array;
      }

      /**
           * Returns a 2D array containing a copy of the data
           * @return {Array}
           */
      to2DArray() {
        var copy = new Array(this.rows);
        for (var i = 0; i < this.rows; i++) {
          copy[i] = new Array(this.columns);
          for (var j = 0; j < this.columns; j++) {
            copy[i][j] = this.get(i, j);
          }
        }
        return copy;
      }

      /**
           * @return {boolean} true if the matrix has one row
           */
      isRowVector() {
        return this.rows === 1;
      }

      /**
           * @return {boolean} true if the matrix has one column
           */
      isColumnVector() {
        return this.columns === 1;
      }

      /**
           * @return {boolean} true if the matrix has one row or one column
           */
      isVector() {
        return (this.rows === 1) || (this.columns === 1);
      }

      /**
           * @return {boolean} true if the matrix has the same number of rows and columns
           */
      isSquare() {
        return this.rows === this.columns;
      }

      /**
           * @return {boolean} true if the matrix is square and has the same values on both sides of the diagonal
           */
      isSymmetric() {
        if (this.isSquare()) {
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j <= i; j++) {
              if (this.get(i, j) !== this.get(j, i)) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }

      /**
           * Sets a given element of the matrix. mat.set(3,4,1) is equivalent to mat[3][4]=1
           * @abstract
           * @param {number} rowIndex - Index of the row
           * @param {number} columnIndex - Index of the column
           * @param {number} value - The new value for the element
           * @return {Matrix} this
           */
      set(rowIndex, columnIndex, value) { // eslint-disable-line no-unused-vars
        throw new Error('set method is unimplemented');
      }

      /**
           * Returns the given element of the matrix. mat.get(3,4) is equivalent to matrix[3][4]
           * @abstract
           * @param {number} rowIndex - Index of the row
           * @param {number} columnIndex - Index of the column
           * @return {number}
           */
      get(rowIndex, columnIndex) { // eslint-disable-line no-unused-vars
        throw new Error('get method is unimplemented');
      }

      /**
           * Creates a new matrix that is a repetition of the current matrix. New matrix has rowRep times the number of
           * rows of the matrix, and colRep times the number of columns of the matrix
           * @param {number} rowRep - Number of times the rows should be repeated
           * @param {number} colRep - Number of times the columns should be re
           * @return {Matrix}
           * @example
           * var matrix = new Matrix([[1,2]]);
           * matrix.repeat(2); // [[1,2],[1,2]]
           */
      repeat(rowRep, colRep) {
        rowRep = rowRep || 1;
        colRep = colRep || 1;
        var matrix = new this.constructor[Symbol.species](this.rows * rowRep, this.columns * colRep);
        for (var i = 0; i < rowRep; i++) {
          for (var j = 0; j < colRep; j++) {
            matrix.setSubMatrix(this, this.rows * i, this.columns * j);
          }
        }
        return matrix;
      }

      /**
           * Fills the matrix with a given value. All elements will be set to this value.
           * @param {number} value - New value
           * @return {Matrix} this
           */
      fill(value) {
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, value);
          }
        }
        return this;
      }

      /**
           * Negates the matrix. All elements will be multiplied by (-1)
           * @return {Matrix} this
           */
      neg() {
        return this.mulS(-1);
      }

      /**
           * Returns a new array from the given row index
           * @param {number} index - Row index
           * @return {Array}
           */
      getRow(index) {
        checkRowIndex(this, index);
        var row = new Array(this.columns);
        for (var i = 0; i < this.columns; i++) {
          row[i] = this.get(index, i);
        }
        return row;
      }

      /**
           * Returns a new row vector from the given row index
           * @param {number} index - Row index
           * @return {Matrix}
           */
      getRowVector(index) {
        return this.constructor.rowVector(this.getRow(index));
      }

      /**
           * Sets a row at the given index
           * @param {number} index - Row index
           * @param {Array|Matrix} array - Array or vector
           * @return {Matrix} this
           */
      setRow(index, array) {
        checkRowIndex(this, index);
        array = checkRowVector(this, array);
        for (var i = 0; i < this.columns; i++) {
          this.set(index, i, array[i]);
        }
        return this;
      }

      /**
           * Swaps two rows
           * @param {number} row1 - First row index
           * @param {number} row2 - Second row index
           * @return {Matrix} this
           */
      swapRows(row1, row2) {
        checkRowIndex(this, row1);
        checkRowIndex(this, row2);
        for (var i = 0; i < this.columns; i++) {
          var temp = this.get(row1, i);
          this.set(row1, i, this.get(row2, i));
          this.set(row2, i, temp);
        }
        return this;
      }

      /**
           * Returns a new array from the given column index
           * @param {number} index - Column index
           * @return {Array}
           */
      getColumn(index) {
        checkColumnIndex(this, index);
        var column = new Array(this.rows);
        for (var i = 0; i < this.rows; i++) {
          column[i] = this.get(i, index);
        }
        return column;
      }

      /**
           * Returns a new column vector from the given column index
           * @param {number} index - Column index
           * @return {Matrix}
           */
      getColumnVector(index) {
        return this.constructor.columnVector(this.getColumn(index));
      }

      /**
           * Sets a column at the given index
           * @param {number} index - Column index
           * @param {Array|Matrix} array - Array or vector
           * @return {Matrix} this
           */
      setColumn(index, array) {
        checkColumnIndex(this, index);
        array = checkColumnVector(this, array);
        for (var i = 0; i < this.rows; i++) {
          this.set(i, index, array[i]);
        }
        return this;
      }

      /**
           * Swaps two columns
           * @param {number} column1 - First column index
           * @param {number} column2 - Second column index
           * @return {Matrix} this
           */
      swapColumns(column1, column2) {
        checkColumnIndex(this, column1);
        checkColumnIndex(this, column2);
        for (var i = 0; i < this.rows; i++) {
          var temp = this.get(i, column1);
          this.set(i, column1, this.get(i, column2));
          this.set(i, column2, temp);
        }
        return this;
      }

      /**
           * Adds the values of a vector to each row
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      addRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + vector[j]);
          }
        }
        return this;
      }

      /**
           * Subtracts the values of a vector from each row
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      subRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - vector[j]);
          }
        }
        return this;
      }

      /**
           * Multiplies the values of a vector with each row
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      mulRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * vector[j]);
          }
        }
        return this;
      }

      /**
           * Divides the values of each row by those of a vector
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      divRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / vector[j]);
          }
        }
        return this;
      }

      /**
           * Adds the values of a vector to each column
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      addColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + vector[i]);
          }
        }
        return this;
      }

      /**
           * Subtracts the values of a vector from each column
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      subColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - vector[i]);
          }
        }
        return this;
      }

      /**
           * Multiplies the values of a vector with each column
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      mulColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * vector[i]);
          }
        }
        return this;
      }

      /**
           * Divides the values of each column by those of a vector
           * @param {Array|Matrix} vector - Array or vector
           * @return {Matrix} this
           */
      divColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / vector[i]);
          }
        }
        return this;
      }

      /**
           * Multiplies the values of a row with a scalar
           * @param {number} index - Row index
           * @param {number} value
           * @return {Matrix} this
           */
      mulRow(index, value) {
        checkRowIndex(this, index);
        for (var i = 0; i < this.columns; i++) {
          this.set(index, i, this.get(index, i) * value);
        }
        return this;
      }

      /**
           * Multiplies the values of a column with a scalar
           * @param {number} index - Column index
           * @param {number} value
           * @return {Matrix} this
           */
      mulColumn(index, value) {
        checkColumnIndex(this, index);
        for (var i = 0; i < this.rows; i++) {
          this.set(i, index, this.get(i, index) * value);
        }
        return this;
      }

      /**
           * Returns the maximum value of the matrix
           * @return {number}
           */
      max() {
        var v = this.get(0, 0);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            if (this.get(i, j) > v) {
              v = this.get(i, j);
            }
          }
        }
        return v;
      }

      /**
           * Returns the index of the maximum value
           * @return {Array}
           */
      maxIndex() {
        var v = this.get(0, 0);
        var idx = [0, 0];
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            if (this.get(i, j) > v) {
              v = this.get(i, j);
              idx[0] = i;
              idx[1] = j;
            }
          }
        }
        return idx;
      }

      /**
           * Returns the minimum value of the matrix
           * @return {number}
           */
      min() {
        var v = this.get(0, 0);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            if (this.get(i, j) < v) {
              v = this.get(i, j);
            }
          }
        }
        return v;
      }

      /**
           * Returns the index of the minimum value
           * @return {Array}
           */
      minIndex() {
        var v = this.get(0, 0);
        var idx = [0, 0];
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            if (this.get(i, j) < v) {
              v = this.get(i, j);
              idx[0] = i;
              idx[1] = j;
            }
          }
        }
        return idx;
      }

      /**
           * Returns the maximum value of one row
           * @param {number} row - Row index
           * @return {number}
           */
      maxRow(row) {
        checkRowIndex(this, row);
        var v = this.get(row, 0);
        for (var i = 1; i < this.columns; i++) {
          if (this.get(row, i) > v) {
            v = this.get(row, i);
          }
        }
        return v;
      }

      /**
           * Returns the index of the maximum value of one row
           * @param {number} row - Row index
           * @return {Array}
           */
      maxRowIndex(row) {
        checkRowIndex(this, row);
        var v = this.get(row, 0);
        var idx = [row, 0];
        for (var i = 1; i < this.columns; i++) {
          if (this.get(row, i) > v) {
            v = this.get(row, i);
            idx[1] = i;
          }
        }
        return idx;
      }

      /**
           * Returns the minimum value of one row
           * @param {number} row - Row index
           * @return {number}
           */
      minRow(row) {
        checkRowIndex(this, row);
        var v = this.get(row, 0);
        for (var i = 1; i < this.columns; i++) {
          if (this.get(row, i) < v) {
            v = this.get(row, i);
          }
        }
        return v;
      }

      /**
           * Returns the index of the maximum value of one row
           * @param {number} row - Row index
           * @return {Array}
           */
      minRowIndex(row) {
        checkRowIndex(this, row);
        var v = this.get(row, 0);
        var idx = [row, 0];
        for (var i = 1; i < this.columns; i++) {
          if (this.get(row, i) < v) {
            v = this.get(row, i);
            idx[1] = i;
          }
        }
        return idx;
      }

      /**
           * Returns the maximum value of one column
           * @param {number} column - Column index
           * @return {number}
           */
      maxColumn(column) {
        checkColumnIndex(this, column);
        var v = this.get(0, column);
        for (var i = 1; i < this.rows; i++) {
          if (this.get(i, column) > v) {
            v = this.get(i, column);
          }
        }
        return v;
      }

      /**
           * Returns the index of the maximum value of one column
           * @param {number} column - Column index
           * @return {Array}
           */
      maxColumnIndex(column) {
        checkColumnIndex(this, column);
        var v = this.get(0, column);
        var idx = [0, column];
        for (var i = 1; i < this.rows; i++) {
          if (this.get(i, column) > v) {
            v = this.get(i, column);
            idx[0] = i;
          }
        }
        return idx;
      }

      /**
           * Returns the minimum value of one column
           * @param {number} column - Column index
           * @return {number}
           */
      minColumn(column) {
        checkColumnIndex(this, column);
        var v = this.get(0, column);
        for (var i = 1; i < this.rows; i++) {
          if (this.get(i, column) < v) {
            v = this.get(i, column);
          }
        }
        return v;
      }

      /**
           * Returns the index of the minimum value of one column
           * @param {number} column - Column index
           * @return {Array}
           */
      minColumnIndex(column) {
        checkColumnIndex(this, column);
        var v = this.get(0, column);
        var idx = [0, column];
        for (var i = 1; i < this.rows; i++) {
          if (this.get(i, column) < v) {
            v = this.get(i, column);
            idx[0] = i;
          }
        }
        return idx;
      }

      /**
           * Returns an array containing the diagonal values of the matrix
           * @return {Array}
           */
      diag() {
        var min = Math.min(this.rows, this.columns);
        var diag = new Array(min);
        for (var i = 0; i < min; i++) {
          diag[i] = this.get(i, i);
        }
        return diag;
      }

      /**
           * Returns the sum by the argument given, if no argument given,
           * it returns the sum of all elements of the matrix.
           * @param {string} by - sum by 'row' or 'column'.
           * @return {Matrix|number}
           */
      sum(by) {
        switch (by) {
          case 'row':
            return sumByRow(this);
          case 'column':
            return sumByColumn(this);
          default:
            return sumAll(this);
        }
      }

      /**
           * Returns the mean of all elements of the matrix
           * @return {number}
           */
      mean() {
        return this.sum() / this.size;
      }

      /**
           * Returns the product of all elements of the matrix
           * @return {number}
           */
      prod() {
        var prod = 1;
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            prod *= this.get(i, j);
          }
        }
        return prod;
      }

      /**
           * Returns the norm of a matrix.
           * @param {string} type - "frobenius" (default) or "max" return resp. the Frobenius norm and the max norm.
           * @return {number}
           */
      norm(type = 'frobenius') {
        var result = 0;
        if (type === 'max') {
          return this.max();
        } else if (type === 'frobenius') {
          for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
              result = result + this.get(i, j) * this.get(i, j);
            }
          }
          return Math.sqrt(result);
        } else {
          throw new RangeError(`unknown norm type: ${type}`);
        }
      }

      /**
           * Computes the cumulative sum of the matrix elements (in place, row by row)
           * @return {Matrix} this
           */
      cumulativeSum() {
        var sum = 0;
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            sum += this.get(i, j);
            this.set(i, j, sum);
          }
        }
        return this;
      }

      /**
           * Computes the dot (scalar) product between the matrix and another
           * @param {Matrix} vector2 vector
           * @return {number}
           */
      dot(vector2) {
        if (Matrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
        var vector1 = this.to1DArray();
        if (vector1.length !== vector2.length) {
          throw new RangeError('vectors do not have the same size');
        }
        var dot = 0;
        for (var i = 0; i < vector1.length; i++) {
          dot += vector1[i] * vector2[i];
        }
        return dot;
      }

      /**
           * Returns the matrix product between this and other
           * @param {Matrix} other
           * @return {Matrix}
           */
      mmul(other) {
        other = this.constructor.checkMatrix(other);
        if (this.columns !== other.rows) {
          // eslint-disable-next-line no-console
          console.warn('Number of columns of left matrix are not equal to number of rows of right matrix.');
        }

        var m = this.rows;
        var n = this.columns;
        var p = other.columns;

        var result = new this.constructor[Symbol.species](m, p);

        var Bcolj = new Array(n);
        for (var j = 0; j < p; j++) {
          for (var k = 0; k < n; k++) {
            Bcolj[k] = other.get(k, j);
          }

          for (var i = 0; i < m; i++) {
            var s = 0;
            for (k = 0; k < n; k++) {
              s += this.get(i, k) * Bcolj[k];
            }

            result.set(i, j, s);
          }
        }
        return result;
      }

      strassen2x2(other) {
        var result = new this.constructor[Symbol.species](2, 2);
        const a11 = this.get(0, 0);
        const b11 = other.get(0, 0);
        const a12 = this.get(0, 1);
        const b12 = other.get(0, 1);
        const a21 = this.get(1, 0);
        const b21 = other.get(1, 0);
        const a22 = this.get(1, 1);
        const b22 = other.get(1, 1);

        // Compute intermediate values.
        const m1 = (a11 + a22) * (b11 + b22);
        const m2 = (a21 + a22) * b11;
        const m3 = a11 * (b12 - b22);
        const m4 = a22 * (b21 - b11);
        const m5 = (a11 + a12) * b22;
        const m6 = (a21 - a11) * (b11 + b12);
        const m7 = (a12 - a22) * (b21 + b22);

        // Combine intermediate values into the output.
        const c00 = m1 + m4 - m5 + m7;
        const c01 = m3 + m5;
        const c10 = m2 + m4;
        const c11 = m1 - m2 + m3 + m6;

        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        return result;
      }

      strassen3x3(other) {
        var result = new this.constructor[Symbol.species](3, 3);

        const a00 = this.get(0, 0);
        const a01 = this.get(0, 1);
        const a02 = this.get(0, 2);
        const a10 = this.get(1, 0);
        const a11 = this.get(1, 1);
        const a12 = this.get(1, 2);
        const a20 = this.get(2, 0);
        const a21 = this.get(2, 1);
        const a22 = this.get(2, 2);

        const b00 = other.get(0, 0);
        const b01 = other.get(0, 1);
        const b02 = other.get(0, 2);
        const b10 = other.get(1, 0);
        const b11 = other.get(1, 1);
        const b12 = other.get(1, 2);
        const b20 = other.get(2, 0);
        const b21 = other.get(2, 1);
        const b22 = other.get(2, 2);

        const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
        const m2 = (a00 - a10) * (-b01 + b11);
        const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
        const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
        const m5 = (a10 + a11) * (-b00 + b01);
        const m6 = a00 * b00;
        const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
        const m8 = (-a00 + a20) * (b02 - b12);
        const m9 = (a20 + a21) * (-b00 + b02);
        const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
        const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
        const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
        const m13 = (a02 - a22) * (b11 - b21);
        const m14 = a02 * b20;
        const m15 = (a21 + a22) * (-b20 + b21);
        const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
        const m17 = (a02 - a12) * (b12 - b22);
        const m18 = (a11 + a12) * (-b20 + b22);
        const m19 = a01 * b10;
        const m20 = a12 * b21;
        const m21 = a10 * b02;
        const m22 = a20 * b01;
        const m23 = a22 * b22;

        const c00 = m6 + m14 + m19;
        const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
        const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
        const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
        const c11 = m2 + m4 + m5 + m6 + m20;
        const c12 = m14 + m16 + m17 + m18 + m21;
        const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
        const c21 = m12 + m13 + m14 + m15 + m22;
        const c22 = m6 + m7 + m8 + m9 + m23;

        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(0, 2, c02);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        result.set(1, 2, c12);
        result.set(2, 0, c20);
        result.set(2, 1, c21);
        result.set(2, 2, c22);
        return result;
      }

      /**
           * Returns the matrix product between x and y. More efficient than mmul(other) only when we multiply squared matrix and when the size of the matrix is > 1000.
           * @param {Matrix} y
           * @return {Matrix}
           */
      mmulStrassen(y) {
        var x = this.clone();
        var r1 = x.rows;
        var c1 = x.columns;
        var r2 = y.rows;
        var c2 = y.columns;
        if (c1 !== r2) {
          // eslint-disable-next-line no-console
          console.warn(`Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`);
        }

        // Put a matrix into the top left of a matrix of zeros.
        // `rows` and `cols` are the dimensions of the output matrix.
        function embed(mat, rows, cols) {
          var r = mat.rows;
          var c = mat.columns;
          if ((r === rows) && (c === cols)) {
            return mat;
          } else {
            var resultat = Matrix.zeros(rows, cols);
            resultat = resultat.setSubMatrix(mat, 0, 0);
            return resultat;
          }
        }


        // Make sure both matrices are the same size.
        // This is exclusively for simplicity:
        // this algorithm can be implemented with matrices of different sizes.

        var r = Math.max(r1, r2);
        var c = Math.max(c1, c2);
        x = embed(x, r, c);
        y = embed(y, r, c);

        // Our recursive multiplication function.
        function blockMult(a, b, rows, cols) {
          // For small matrices, resort to naive multiplication.
          if (rows <= 512 || cols <= 512) {
            return a.mmul(b); // a is equivalent to this
          }

          // Apply dynamic padding.
          if ((rows % 2 === 1) && (cols % 2 === 1)) {
            a = embed(a, rows + 1, cols + 1);
            b = embed(b, rows + 1, cols + 1);
          } else if (rows % 2 === 1) {
            a = embed(a, rows + 1, cols);
            b = embed(b, rows + 1, cols);
          } else if (cols % 2 === 1) {
            a = embed(a, rows, cols + 1);
            b = embed(b, rows, cols + 1);
          }

          var halfRows = parseInt(a.rows / 2, 10);
          var halfCols = parseInt(a.columns / 2, 10);
          // Subdivide input matrices.
          var a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
          var b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);

          var a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
          var b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);

          var a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
          var b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);

          var a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
          var b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);

          // Compute intermediate values.
          var m1 = blockMult(Matrix.add(a11, a22), Matrix.add(b11, b22), halfRows, halfCols);
          var m2 = blockMult(Matrix.add(a21, a22), b11, halfRows, halfCols);
          var m3 = blockMult(a11, Matrix.sub(b12, b22), halfRows, halfCols);
          var m4 = blockMult(a22, Matrix.sub(b21, b11), halfRows, halfCols);
          var m5 = blockMult(Matrix.add(a11, a12), b22, halfRows, halfCols);
          var m6 = blockMult(Matrix.sub(a21, a11), Matrix.add(b11, b12), halfRows, halfCols);
          var m7 = blockMult(Matrix.sub(a12, a22), Matrix.add(b21, b22), halfRows, halfCols);

          // Combine intermediate values into the output.
          var c11 = Matrix.add(m1, m4);
          c11.sub(m5);
          c11.add(m7);
          var c12 = Matrix.add(m3, m5);
          var c21 = Matrix.add(m2, m4);
          var c22 = Matrix.sub(m1, m2);
          c22.add(m3);
          c22.add(m6);

          // Crop output to the desired size (undo dynamic padding).
          var resultat = Matrix.zeros(2 * c11.rows, 2 * c11.columns);
          resultat = resultat.setSubMatrix(c11, 0, 0);
          resultat = resultat.setSubMatrix(c12, c11.rows, 0);
          resultat = resultat.setSubMatrix(c21, 0, c11.columns);
          resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
          return resultat.subMatrix(0, rows - 1, 0, cols - 1);
        }
        return blockMult(x, y, r, c);
      }

      /**
           * Returns a row-by-row scaled matrix
           * @param {number} [min=0] - Minimum scaled value
           * @param {number} [max=1] - Maximum scaled value
           * @return {Matrix} - The scaled matrix
           */
      scaleRows(min, max) {
        min = min === undefined ? 0 : min;
        max = max === undefined ? 1 : max;
        if (min >= max) {
          throw new RangeError('min should be strictly smaller than max');
        }
        var newMatrix = this.constructor.empty(this.rows, this.columns);
        for (var i = 0; i < this.rows; i++) {
          var scaled = rescale(this.getRow(i), { min, max });
          newMatrix.setRow(i, scaled);
        }
        return newMatrix;
      }

      /**
           * Returns a new column-by-column scaled matrix
           * @param {number} [min=0] - Minimum scaled value
           * @param {number} [max=1] - Maximum scaled value
           * @return {Matrix} - The new scaled matrix
           * @example
           * var matrix = new Matrix([[1,2],[-1,0]]);
           * var scaledMatrix = matrix.scaleColumns(); // [[1,1],[0,0]]
           */
      scaleColumns(min, max) {
        min = min === undefined ? 0 : min;
        max = max === undefined ? 1 : max;
        if (min >= max) {
          throw new RangeError('min should be strictly smaller than max');
        }
        var newMatrix = this.constructor.empty(this.rows, this.columns);
        for (var i = 0; i < this.columns; i++) {
          var scaled = rescale(this.getColumn(i), {
            min: min,
            max: max
          });
          newMatrix.setColumn(i, scaled);
        }
        return newMatrix;
      }


      /**
           * Returns the Kronecker product (also known as tensor product) between this and other
           * See https://en.wikipedia.org/wiki/Kronecker_product
           * @param {Matrix} other
           * @return {Matrix}
           */
      kroneckerProduct(other) {
        other = this.constructor.checkMatrix(other);

        var m = this.rows;
        var n = this.columns;
        var p = other.rows;
        var q = other.columns;

        var result = new this.constructor[Symbol.species](m * p, n * q);
        for (var i = 0; i < m; i++) {
          for (var j = 0; j < n; j++) {
            for (var k = 0; k < p; k++) {
              for (var l = 0; l < q; l++) {
                result[p * i + k][q * j + l] = this.get(i, j) * other.get(k, l);
              }
            }
          }
        }
        return result;
      }

      /**
           * Transposes the matrix and returns a new one containing the result
           * @return {Matrix}
           */
      transpose() {
        var result = new this.constructor[Symbol.species](this.columns, this.rows);
        for (var i = 0; i < this.rows; i++) {
          for (var j = 0; j < this.columns; j++) {
            result.set(j, i, this.get(i, j));
          }
        }
        return result;
      }

      /**
           * Sorts the rows (in place)
           * @param {function} compareFunction - usual Array.prototype.sort comparison function
           * @return {Matrix} this
           */
      sortRows(compareFunction) {
        if (compareFunction === undefined) compareFunction = compareNumbers;
        for (var i = 0; i < this.rows; i++) {
          this.setRow(i, this.getRow(i).sort(compareFunction));
        }
        return this;
      }

      /**
           * Sorts the columns (in place)
           * @param {function} compareFunction - usual Array.prototype.sort comparison function
           * @return {Matrix} this
           */
      sortColumns(compareFunction) {
        if (compareFunction === undefined) compareFunction = compareNumbers;
        for (var i = 0; i < this.columns; i++) {
          this.setColumn(i, this.getColumn(i).sort(compareFunction));
        }
        return this;
      }

      /**
           * Returns a subset of the matrix
           * @param {number} startRow - First row index
           * @param {number} endRow - Last row index
           * @param {number} startColumn - First column index
           * @param {number} endColumn - Last column index
           * @return {Matrix}
           */
      subMatrix(startRow, endRow, startColumn, endColumn) {
        checkRange(this, startRow, endRow, startColumn, endColumn);
        var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, endColumn - startColumn + 1);
        for (var i = startRow; i <= endRow; i++) {
          for (var j = startColumn; j <= endColumn; j++) {
            newMatrix[i - startRow][j - startColumn] = this.get(i, j);
          }
        }
        return newMatrix;
      }

      /**
           * Returns a subset of the matrix based on an array of row indices
           * @param {Array} indices - Array containing the row indices
           * @param {number} [startColumn = 0] - First column index
           * @param {number} [endColumn = this.columns-1] - Last column index
           * @return {Matrix}
           */
      subMatrixRow(indices, startColumn, endColumn) {
        if (startColumn === undefined) startColumn = 0;
        if (endColumn === undefined) endColumn = this.columns - 1;
        if ((startColumn > endColumn) || (startColumn < 0) || (startColumn >= this.columns) || (endColumn < 0) || (endColumn >= this.columns)) {
          throw new RangeError('Argument out of range');
        }

        var newMatrix = new this.constructor[Symbol.species](indices.length, endColumn - startColumn + 1);
        for (var i = 0; i < indices.length; i++) {
          for (var j = startColumn; j <= endColumn; j++) {
            if (indices[i] < 0 || indices[i] >= this.rows) {
              throw new RangeError(`Row index out of range: ${indices[i]}`);
            }
            newMatrix.set(i, j - startColumn, this.get(indices[i], j));
          }
        }
        return newMatrix;
      }

      /**
           * Returns a subset of the matrix based on an array of column indices
           * @param {Array} indices - Array containing the column indices
           * @param {number} [startRow = 0] - First row index
           * @param {number} [endRow = this.rows-1] - Last row index
           * @return {Matrix}
           */
      subMatrixColumn(indices, startRow, endRow) {
        if (startRow === undefined) startRow = 0;
        if (endRow === undefined) endRow = this.rows - 1;
        if ((startRow > endRow) || (startRow < 0) || (startRow >= this.rows) || (endRow < 0) || (endRow >= this.rows)) {
          throw new RangeError('Argument out of range');
        }

        var newMatrix = new this.constructor[Symbol.species](endRow - startRow + 1, indices.length);
        for (var i = 0; i < indices.length; i++) {
          for (var j = startRow; j <= endRow; j++) {
            if (indices[i] < 0 || indices[i] >= this.columns) {
              throw new RangeError(`Column index out of range: ${indices[i]}`);
            }
            newMatrix.set(j - startRow, i, this.get(j, indices[i]));
          }
        }
        return newMatrix;
      }

      /**
           * Set a part of the matrix to the given sub-matrix
           * @param {Matrix|Array< Array >} matrix - The source matrix from which to extract values.
           * @param {number} startRow - The index of the first row to set
           * @param {number} startColumn - The index of the first column to set
           * @return {Matrix}
           */
      setSubMatrix(matrix, startRow, startColumn) {
        matrix = this.constructor.checkMatrix(matrix);
        var endRow = startRow + matrix.rows - 1;
        var endColumn = startColumn + matrix.columns - 1;
        checkRange(this, startRow, endRow, startColumn, endColumn);
        for (var i = 0; i < matrix.rows; i++) {
          for (var j = 0; j < matrix.columns; j++) {
            this[startRow + i][startColumn + j] = matrix.get(i, j);
          }
        }
        return this;
      }

      /**
           * Return a new matrix based on a selection of rows and columns
           * @param {Array<number>} rowIndices - The row indices to select. Order matters and an index can be more than once.
           * @param {Array<number>} columnIndices - The column indices to select. Order matters and an index can be use more than once.
           * @return {Matrix} The new matrix
           */
      selection(rowIndices, columnIndices) {
        var indices = checkIndices(this, rowIndices, columnIndices);
        var newMatrix = new this.constructor[Symbol.species](rowIndices.length, columnIndices.length);
        for (var i = 0; i < indices.row.length; i++) {
          var rowIndex = indices.row[i];
          for (var j = 0; j < indices.column.length; j++) {
            var columnIndex = indices.column[j];
            newMatrix[i][j] = this.get(rowIndex, columnIndex);
          }
        }
        return newMatrix;
      }

      /**
           * Returns the trace of the matrix (sum of the diagonal elements)
           * @return {number}
           */
      trace() {
        var min = Math.min(this.rows, this.columns);
        var trace = 0;
        for (var i = 0; i < min; i++) {
          trace += this.get(i, i);
        }
        return trace;
      }

      /*
           Matrix views
           */

      /**
           * Returns a view of the transposition of the matrix
           * @return {MatrixTransposeView}
           */
      transposeView() {
        return new MatrixTransposeView(this);
      }

      /**
           * Returns a view of the row vector with the given index
           * @param {number} row - row index of the vector
           * @return {MatrixRowView}
           */
      rowView(row) {
        checkRowIndex(this, row);
        return new MatrixRowView(this, row);
      }

      /**
           * Returns a view of the column vector with the given index
           * @param {number} column - column index of the vector
           * @return {MatrixColumnView}
           */
      columnView(column) {
        checkColumnIndex(this, column);
        return new MatrixColumnView(this, column);
      }

      /**
           * Returns a view of the matrix flipped in the row axis
           * @return {MatrixFlipRowView}
           */
      flipRowView() {
        return new MatrixFlipRowView(this);
      }

      /**
           * Returns a view of the matrix flipped in the column axis
           * @return {MatrixFlipColumnView}
           */
      flipColumnView() {
        return new MatrixFlipColumnView(this);
      }

      /**
           * Returns a view of a submatrix giving the index boundaries
           * @param {number} startRow - first row index of the submatrix
           * @param {number} endRow - last row index of the submatrix
           * @param {number} startColumn - first column index of the submatrix
           * @param {number} endColumn - last column index of the submatrix
           * @return {MatrixSubView}
           */
      subMatrixView(startRow, endRow, startColumn, endColumn) {
        return new MatrixSubView(this, startRow, endRow, startColumn, endColumn);
      }

      /**
           * Returns a view of the cross of the row indices and the column indices
           * @example
           * // resulting vector is [[2], [2]]
           * var matrix = new Matrix([[1,2,3], [4,5,6]]).selectionView([0, 0], [1])
           * @param {Array<number>} rowIndices
           * @param {Array<number>} columnIndices
           * @return {MatrixSelectionView}
           */
      selectionView(rowIndices, columnIndices) {
        return new MatrixSelectionView(this, rowIndices, columnIndices);
      }

      /**
           * Returns a view of the row indices
           * @example
           * // resulting vector is [[1,2,3], [1,2,3]]
           * var matrix = new Matrix([[1,2,3], [4,5,6]]).rowSelectionView([0, 0])
           * @param {Array<number>} rowIndices
           * @return {MatrixRowSelectionView}
           */
      rowSelectionView(rowIndices) {
        return new MatrixRowSelectionView(this, rowIndices);
      }

      /**
           * Returns a view of the column indices
           * @example
           * // resulting vector is [[2, 2], [5, 5]]
           * var matrix = new Matrix([[1,2,3], [4,5,6]]).columnSelectionView([1, 1])
           * @param {Array<number>} columnIndices
           * @return {MatrixColumnSelectionView}
           */
      columnSelectionView(columnIndices) {
        return new MatrixColumnSelectionView(this, columnIndices);
      }


      /**
          * Calculates and returns the determinant of a matrix as a Number
          * @example
          *   new Matrix([[1,2,3], [4,5,6]]).det()
          * @return {number}
          */
      det() {
        if (this.isSquare()) {
          var a, b, c, d;
          if (this.columns === 2) {
            // 2 x 2 matrix
            a = this.get(0, 0);
            b = this.get(0, 1);
            c = this.get(1, 0);
            d = this.get(1, 1);

            return a * d - (b * c);
          } else if (this.columns === 3) {
            // 3 x 3 matrix
            var subMatrix0, subMatrix1, subMatrix2;
            subMatrix0 = this.selectionView([1, 2], [1, 2]);
            subMatrix1 = this.selectionView([1, 2], [0, 2]);
            subMatrix2 = this.selectionView([1, 2], [0, 1]);
            a = this.get(0, 0);
            b = this.get(0, 1);
            c = this.get(0, 2);

            return a * subMatrix0.det() - b * subMatrix1.det() + c * subMatrix2.det();
          } else {
            // general purpose determinant using the LU decomposition
            return new LuDecomposition(this).determinant;
          }
        } else {
          throw Error('Determinant can only be calculated for a square matrix.');
        }
      }

      /**
           * Returns inverse of a matrix if it exists or the pseudoinverse
           * @param {number} threshold - threshold for taking inverse of singular values (default = 1e-15)
           * @return {Matrix} the (pseudo)inverted matrix.
           */
      pseudoInverse(threshold) {
        if (threshold === undefined) threshold = Number.EPSILON;
        var svdSolution = new SingularValueDecomposition(this, { autoTranspose: true });

        var U = svdSolution.leftSingularVectors;
        var V = svdSolution.rightSingularVectors;
        var s = svdSolution.diagonal;

        for (var i = 0; i < s.length; i++) {
          if (Math.abs(s[i]) > threshold) {
            s[i] = 1.0 / s[i];
          } else {
            s[i] = 0.0;
          }
        }

        // convert list to diagonal
        s = this.constructor[Symbol.species].diag(s);
        return V.mmul(s.mmul(U.transposeView()));
      }

      /**
           * Creates an exact and independent copy of the matrix
           * @return {Matrix}
           */
      clone() {
        var newMatrix = new this.constructor[Symbol.species](this.rows, this.columns);
        for (var row = 0; row < this.rows; row++) {
          for (var column = 0; column < this.columns; column++) {
            newMatrix.set(row, column, this.get(row, column));
          }
        }
        return newMatrix;
      }
    }

    Matrix.prototype.klass = 'Matrix';

    function compareNumbers(a, b) {
      return a - b;
    }

    /*
       Synonyms
       */

    Matrix.random = Matrix.rand;
    Matrix.diagonal = Matrix.diag;
    Matrix.prototype.diagonal = Matrix.prototype.diag;
    Matrix.identity = Matrix.eye;
    Matrix.prototype.negate = Matrix.prototype.neg;
    Matrix.prototype.tensorProduct = Matrix.prototype.kroneckerProduct;
    Matrix.prototype.determinant = Matrix.prototype.det;

    /*
       Add dynamically instance and static methods for mathematical operations
       */

    var inplaceOperator = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;

    var inplaceOperatorScalar = `
(function %name%S(value) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) %op% value);
        }
    }
    return this;
})
`;

    var inplaceOperatorMatrix = `
(function %name%M(matrix) {
    matrix = this.constructor.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) %op% matrix.get(i, j));
        }
    }
    return this;
})
`;

    var staticOperator = `
(function %name%(matrix, value) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%(value);
})
`;

    var inplaceMethod = `
(function %name%() {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j)));
        }
    }
    return this;
})
`;

    var staticMethod = `
(function %name%(matrix) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%();
})
`;

    var inplaceMethodWithArgs = `
(function %name%(%args%) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), %args%));
        }
    }
    return this;
})
`;

    var staticMethodWithArgs = `
(function %name%(matrix, %args%) {
    var newMatrix = new this[Symbol.species](matrix);
    return newMatrix.%name%(%args%);
})
`;


    var inplaceMethodWithOneArgScalar = `
(function %name%S(value) {
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), value));
        }
    }
    return this;
})
`;
    var inplaceMethodWithOneArgMatrix = `
(function %name%M(matrix) {
    matrix = this.constructor.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
    }
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.columns; j++) {
            this.set(i, j, %method%(this.get(i, j), matrix.get(i, j)));
        }
    }
    return this;
})
`;

    var inplaceMethodWithOneArg = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;

    var staticMethodWithOneArg = staticMethodWithArgs;

    var operators = [
      // Arithmetic operators
      ['+', 'add'],
      ['-', 'sub', 'subtract'],
      ['*', 'mul', 'multiply'],
      ['/', 'div', 'divide'],
      ['%', 'mod', 'modulus'],
      // Bitwise operators
      ['&', 'and'],
      ['|', 'or'],
      ['^', 'xor'],
      ['<<', 'leftShift'],
      ['>>', 'signPropagatingRightShift'],
      ['>>>', 'rightShift', 'zeroFillRightShift']
    ];

    var i;
    var eval2 = eval; // eslint-disable-line no-eval
    for (var operator of operators) {
      var inplaceOp = eval2(fillTemplateFunction(inplaceOperator, { name: operator[1], op: operator[0] }));
      var inplaceOpS = eval2(fillTemplateFunction(inplaceOperatorScalar, { name: `${operator[1]}S`, op: operator[0] }));
      var inplaceOpM = eval2(fillTemplateFunction(inplaceOperatorMatrix, { name: `${operator[1]}M`, op: operator[0] }));
      var staticOp = eval2(fillTemplateFunction(staticOperator, { name: operator[1] }));
      for (i = 1; i < operator.length; i++) {
        Matrix.prototype[operator[i]] = inplaceOp;
        Matrix.prototype[`${operator[i]}S`] = inplaceOpS;
        Matrix.prototype[`${operator[i]}M`] = inplaceOpM;
        Matrix[operator[i]] = staticOp;
      }
    }

    var methods = [['~', 'not']];

    [
      'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'cbrt', 'ceil',
      'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'log', 'log1p',
      'log10', 'log2', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'
    ].forEach(function (mathMethod) {
      methods.push([`Math.${mathMethod}`, mathMethod]);
    });

    for (var method of methods) {
      var inplaceMeth = eval2(fillTemplateFunction(inplaceMethod, { name: method[1], method: method[0] }));
      var staticMeth = eval2(fillTemplateFunction(staticMethod, { name: method[1] }));
      for (i = 1; i < method.length; i++) {
        Matrix.prototype[method[i]] = inplaceMeth;
        Matrix[method[i]] = staticMeth;
      }
    }

    var methodsWithArgs = [['Math.pow', 1, 'pow']];

    for (var methodWithArg of methodsWithArgs) {
      var args = 'arg0';
      for (i = 1; i < methodWithArg[1]; i++) {
        args += `, arg${i}`;
      }
      if (methodWithArg[1] !== 1) {
        var inplaceMethWithArgs = eval2(fillTemplateFunction(inplaceMethodWithArgs, {
          name: methodWithArg[2],
          method: methodWithArg[0],
          args: args
        }));
        var staticMethWithArgs = eval2(fillTemplateFunction(staticMethodWithArgs, { name: methodWithArg[2], args: args }));
        for (i = 2; i < methodWithArg.length; i++) {
          Matrix.prototype[methodWithArg[i]] = inplaceMethWithArgs;
          Matrix[methodWithArg[i]] = staticMethWithArgs;
        }
      } else {
        var tmplVar = {
          name: methodWithArg[2],
          args: args,
          method: methodWithArg[0]
        };
        var inplaceMethod2 = eval2(fillTemplateFunction(inplaceMethodWithOneArg, tmplVar));
        var inplaceMethodS = eval2(fillTemplateFunction(inplaceMethodWithOneArgScalar, tmplVar));
        var inplaceMethodM = eval2(fillTemplateFunction(inplaceMethodWithOneArgMatrix, tmplVar));
        var staticMethod2 = eval2(fillTemplateFunction(staticMethodWithOneArg, tmplVar));
        for (i = 2; i < methodWithArg.length; i++) {
          Matrix.prototype[methodWithArg[i]] = inplaceMethod2;
          Matrix.prototype[`${methodWithArg[i]}M`] = inplaceMethodM;
          Matrix.prototype[`${methodWithArg[i]}S`] = inplaceMethodS;
          Matrix[methodWithArg[i]] = staticMethod2;
        }
      }
    }

    function fillTemplateFunction(template, values) {
      for (var value in values) {
        template = template.replace(new RegExp(`%${value}%`, 'g'), values[value]);
      }
      return template;
    }

    return Matrix;
  }

  class Matrix extends AbstractMatrix(Array) {
    constructor(nRows, nColumns) {
      var i;
      if (arguments.length === 1 && typeof nRows === 'number') {
        return new Array(nRows);
      }
      if (Matrix.isMatrix(nRows)) {
        return nRows.clone();
      } else if (Number.isInteger(nRows) && nRows > 0) {
        // Create an empty matrix
        super(nRows);
        if (Number.isInteger(nColumns) && nColumns > 0) {
          for (i = 0; i < nRows; i++) {
            this[i] = new Array(nColumns);
          }
        } else {
          throw new TypeError('nColumns must be a positive integer');
        }
      } else if (Array.isArray(nRows)) {
        // Copy the values from the 2D array
        const matrix = nRows;
        nRows = matrix.length;
        nColumns = matrix[0].length;
        if (typeof nColumns !== 'number' || nColumns === 0) {
          throw new TypeError(
            'Data must be a 2D array with at least one element'
          );
        }
        super(nRows);
        for (i = 0; i < nRows; i++) {
          if (matrix[i].length !== nColumns) {
            throw new RangeError('Inconsistent array dimensions');
          }
          this[i] = [].concat(matrix[i]);
        }
      } else {
        throw new TypeError(
          'First argument must be a positive number or an array'
        );
      }
      this.rows = nRows;
      this.columns = nColumns;
      return this;
    }

    set(rowIndex, columnIndex, value) {
      this[rowIndex][columnIndex] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      return this[rowIndex][columnIndex];
    }

    /**
     * Removes a row from the given index
     * @param {number} index - Row index
     * @return {Matrix} this
     */
    removeRow(index) {
      checkRowIndex(this, index);
      if (this.rows === 1) {
        throw new RangeError('A matrix cannot have less than one row');
      }
      this.splice(index, 1);
      this.rows -= 1;
      return this;
    }

    /**
     * Adds a row at the given index
     * @param {number} [index = this.rows] - Row index
     * @param {Array|Matrix} array - Array or vector
     * @return {Matrix} this
     */
    addRow(index, array) {
      if (array === undefined) {
        array = index;
        index = this.rows;
      }
      checkRowIndex(this, index, true);
      array = checkRowVector(this, array, true);
      this.splice(index, 0, array);
      this.rows += 1;
      return this;
    }

    /**
     * Removes a column from the given index
     * @param {number} index - Column index
     * @return {Matrix} this
     */
    removeColumn(index) {
      checkColumnIndex(this, index);
      if (this.columns === 1) {
        throw new RangeError('A matrix cannot have less than one column');
      }
      for (var i = 0; i < this.rows; i++) {
        this[i].splice(index, 1);
      }
      this.columns -= 1;
      return this;
    }

    /**
     * Adds a column at the given index
     * @param {number} [index = this.columns] - Column index
     * @param {Array|Matrix} array - Array or vector
     * @return {Matrix} this
     */
    addColumn(index, array) {
      if (typeof array === 'undefined') {
        array = index;
        index = this.columns;
      }
      checkColumnIndex(this, index, true);
      array = checkColumnVector(this, array);
      for (var i = 0; i < this.rows; i++) {
        this[i].splice(index, 0, array[i]);
      }
      this.columns += 1;
      return this;
    }
  }

  class WrapperMatrix1D extends AbstractMatrix() {
    /**
     * @class WrapperMatrix1D
     * @param {Array<number>} data
     * @param {object} [options]
     * @param {object} [options.rows = 1]
     */
    constructor(data, options = {}) {
      const { rows = 1 } = options;

      if (data.length % rows !== 0) {
        throw new Error('the data length is not divisible by the number of rows');
      }
      super();
      this.rows = rows;
      this.columns = data.length / rows;
      this.data = data;
    }

    set(rowIndex, columnIndex, value) {
      var index = this._calculateIndex(rowIndex, columnIndex);
      this.data[index] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      var index = this._calculateIndex(rowIndex, columnIndex);
      return this.data[index];
    }

    _calculateIndex(row, column) {
      return row * this.columns + column;
    }

    static get [Symbol.species]() {
      return Matrix;
    }
  }

  class WrapperMatrix2D extends AbstractMatrix() {
    /**
     * @class WrapperMatrix2D
     * @param {Array<Array<number>>} data
     */
    constructor(data) {
      super();
      this.data = data;
      this.rows = data.length;
      this.columns = data[0].length;
    }

    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }

    static get [Symbol.species]() {
      return Matrix;
    }
  }

  //import Pixel from './Pixel'

  class Game {
  	constructor($wrapper, options) {
  		this.$wrapper = $wrapper;
  		this.$image = $wrapper.querySelector('img');
  		$wrapper.querySelector('img').style.opacity = '0.1';

  		// Get image attributes
  		this.image = {
  			width: $wrapper.querySelector('img').offsetWidth,
  			height: $wrapper.querySelector('img').offsetHeight,
  			src: $wrapper.querySelector('img').getAttribute('src')
  		};

  		// Set the number of columns and rows
  		this.columns = options.columns || 10;
  		this.pixelSize = this.image.width / this.columns;
  		this.rows = options.rows || parseInt(this.image.height / this.pixelSize);

  		this.applyWrapperStyle();
  		this.matrix = Matrix.zeros(this.rows, this.columns); // 1 = pixel not used
  	}

  	/** Needed so Pieces can have position absolute */
  	applyWrapperStyle() {
  		Object.assign(this.$wrapper.style, {
  			overflow: 'hidden',
  			position: 'relative',
  		});
  	}

  	/**
  	 * Check if a row has unused pixes
  	 * @param {Number} row Row number (bottom is zero)
  	 * @returns {Boolean}
  	 */
  	rowIsFilled(row) {
  		const rowSums = this.matrix.sum('row');
  		const rowSum = rowSums[this.rows - row - 1][0];
  		return  rowSum === this.columns
  	}

  	/**
  	 * Find a random position for a piece on a specific row
  	 * @param {Number} row Row to search on
  	 * @param {Piece} piece Piece to be fitted
  	 */
  	getRandomSlot(searchRow, piece) {
  		const availableSlots = [];
  		let pieceWidth = piece.shape[0].length;
  		let pieceHeight = piece.shape.length;

  		for (let col = 0; col <= this.columns - pieceWidth; col++) {

  			// Get submatrix for the current coordinates
  			const startRow = this.rows - searchRow - pieceHeight;
  			const endRow = this.rows - searchRow - 1;
  			const startColumn = col;
  			const endColumn = col + pieceWidth -1;

  			// Check for out of bounds
  			if (startRow < 0 || startColumn < 0) {
  				continue;
  			}

  			// Test if the piece fits in the current position by adding the submatrix with the shape
  			const submatrix = this.matrix.subMatrix(startRow, endRow, startColumn, endColumn);
  			const shapeMatrix = new Matrix(piece.shape);
  			const sum = Matrix.add(submatrix, shapeMatrix);
  			const maxIndex = sum.maxIndex();
  			
  			// If 2 is the max it means that the piece overlaps an used pixel in the grid
  			if (sum.get(maxIndex[0], maxIndex[1]) > 1) {
  				continue;
  			}

  			availableSlots.push({ row: searchRow, column: col });
  		}

  		// If no available slots were found return false
  		if (availableSlots.length === 0) {
  			return false
  		}

  		// Return a random slot
  		return availableSlots[parseInt(Math.random() * availableSlots.length)]
  	}

  }

  class Coordinate {
  	constructor(x,y) {
  		this.x = parseInt(x);
  		this.y = parseInt(y);
  	}

  	getX() { return this.x; }
  	getY() { return this.y; }
  	setX(value) { this.x = parseInt(value); }
  	setY(value) { this.y = parseInt(value); }
  }

  /**
   * Multiple pixes compose one Piece
   * Pixel should be calculated from the number of columns that the game matrix has
   */
  class Pixel {

  	/**
  	 * Make an instance of a transparent pixel
  	 * @param {Object} data {size }
  	 */
  	constructor(data) {
  		// Actual size of one pixel
  		this.size = data.size;
  		
  		// Creat div and append
  		this.$div = document.createElement("div");
  		this.$div.setAttribute('class', 'Tetrisify-pixel');
  		this.setInitialStyle();
  	}
  	
  	setInitialStyle(data) {
  		Object.assign(this.$div.style, {
  			height: `${this.size}px`,
  			flexBasis: `${this.size}px`,
  		});
  	}
  }

  /**
   * Multiple pixes compose one Piece
   * Pixel should be calculated from the number of columns that the game matrix has
   * x,y coordinates are relative to the game matrix
   */
  class ImagePixel extends Pixel {

  	/**
  	 * Make an instance
  	 * @param {Obkect} image Image attributes
  	 * @param {Object} data 
  	 */
  	constructor(image, data) {
  		super(data);

  		// Initial data
  		this.coordinate = new Coordinate(data.x, data.y);
  		this.image = image;

  		const className = `Tetrisify-pixel Tetrisify-imagePixel`;
  		this.$div.setAttribute('class', className);
  		this.$div.setAttribute('data-x', this.coordinate.getX());
  		this.$div.setAttribute('data-y', this.coordinate.getY());
  		
  		//Add background image
  		this.addBackgroundStyle();
  	}

  	addBackgroundStyle() {
  		const bgX = this.image.width - this.coordinate.getX() * this.size + 'px ';
  		const bgY = (this.coordinate.getY() + 1) * this.size + 'px';

  		Object.assign(this.$div.style, {
  			background: `url(${this.image.src})`,
  			backgroundPosition: bgX + bgY,
  			backgroundSize: `${this.image.width}px ${this.image.height}px`,
  		});
  	}
  }

  /**
   * Each piece is represented as a matrix where
   * 1 = the pixes is on / selected
   * 0 = the pixes is off / not used
   */
  const pieces = [
  	{
  		name: 'Dot',
  		shape: [[1]],
  	},
  	{
  		name: 'I-piece-vertical',
  		shape: [
  			[1],
  			[1],
  			[1],
  			[1]
  		],
  	},
  	{
  		name: 'I-piece-horizontal',
  		shape: [
  			[1, 1, 1, 1]
  		],
  	},
  	{
  		name: 'J-piece-vertical',
  		shape: [
  			[0, 1],
  			[0, 1],
  			[1, 1],
  		],
  	},
  	{
  		name: 'J-piece-horizontal',
  		shape: [
  			[1, 0, 0],
  			[1, 1, 1],
  		],
  	},
  	{
  		name: 'L-piece-vertical',
  		shape: [
  			[1, 0],
  			[1, 0],
  			[1, 1],
  		],
  	},
  	{
  		name: 'L-piece-horizontal',
  		shape: [
  			[0, 0, 1],
  			[1, 1, 1],
  		],
  	},
  	{
  		name: 'O-piece',
  		shape: [
  			[1, 1],
  			[1, 1],
  		],
  	},
  	{
  		name: 'T-piece',
  		shape: [
  			[0, 1, 0],
  			[1, 1, 1],
  		],
  	},
  ];

  const getRandomShape = () => {
  	const random = parseInt(Math.random() * pieces.length);
  	return pieces[random];
  };

  class Piece {
  	constructor(data) {

  		// Type checking
  		if (!data.shape) throw new Error('Tetrisify: shape parameter is missing')
  		if (!data.pixelSize) throw new Error('Tetrisify: pixelSize parameter is missing')
  		if (!data.image) throw new Error('Tetrisify: image parameter is missing')

  		// Initial datas
  		this.name = data.name; 				// Optional name of the piece
  		this.shape = data.shape; 			// One of the items from the shapes file
  		this.pixelSize = data.pixelSize; 	// Calculated form puzzle resolution (no of columns)
  		this.image = data.image; 			// Object with attributes of the image that is animated

  		// Coordinates used for the falling animation
  		this.currentCoordinates = new Coordinate(-1000, -1000);

  		// Final coordinates when the pice is in place
  		this.finalCoordinates = new Coordinate(-1000, -1000);
  		
  		// States: [Idle, Falling, Done]
  		this.state = 'Idle';
  		
  		// Create div and add css
  		this.$div = document.createElement("div");
  		this.$div.setAttribute('class', 'Tetrisify-piece');
  		this.setInitialStyle();
  	}
  	
  	setInitialStyle() {
  		let width = this.shape[0].length;
  		let height = this.shape.length;

  		Object.assign(this.$div.style, {
  			width: width * this.pixelSize + 'px',
  			height: height * this.pixelSize + 'px',
  		});
  	}

  	setCurrentCoordinates(x,y) {
  		this.currentCoordinates.setX(x);
  		this.currentCoordinates.setY(y);
  		this.$div.style.left = x * this.pixelSize + 'px';
  		this.$div.style.bottom = y * this.pixelSize + 'px';
  	}

  	setFinalCoordinates(x,y) {
  		this.finalCoordinates.setX(x);
  		this.finalCoordinates.setY(y);
  		this.generatePixels();
  	}
  	
  	generatePixels() {
  		// Remove previous children if any
  		this.$div.innerHTML = '';

  		for (let row = 0; row < this.shape.length; row++) {
  			for (let col = 0; col < this.shape[0].length; col++) {
  				
  				let p = null;

  				// Add transparent pixels for 0 values in the shape and ImagePixels for 1
  				if (this.shape[row][col] === 0) {
  					p = new Pixel({ size: this.pixelSize });
  				} else {
  					p = new ImagePixel(this.image, {
  						size: this.pixelSize,
  						x: this.finalCoordinates.getX() + col,
  						y: this.finalCoordinates.getY() + (this.shape.length - row - 1),
  					});
  				}

  				this.$div.append(p.$div);
  			}
  		}
  	}

  }

  /**
   * Extend a shape to be the same size as the game matrix so they can be added
   * @param {Matrix} shape Shape matrix used to describe a Piece
   * @param {Number} startRow start row position of the piece, 0 is at the bottom
   * @param {Number} startCol start column position of the piece, 0 is on the left
   * @param {Number} totalRows total rows in the final matrix
   * @param {Number} totalColumns total columns in the final matrix
   */
  const normalizeShapeMatrix = (shape, startRow, startCol, totalRows, totalColumns) => {
  	// Create empty matrix
  	const m = Matrix.zeros(totalRows, totalColumns);
  	const shapeMatrix = new Matrix(shape);

  	// Add the used pixes of the shape to the matrix
  	for (let row = 0; row < shapeMatrix.rows; row++) {
  		for (let col = 0; col < shapeMatrix.columns; col++) {

  			const rowIndex = totalRows - 0 - startRow - shapeMatrix.rows + row;
  			const colIndex = startCol + col;

  			// Set pixel to 1 for each shape pixel
  			if (shapeMatrix.get(row, col) === 1) {
  				m.set(rowIndex, colIndex, 1);
  			}
  		}
  	}

  	return m
  };

  /**
   * Generate a sequence of pieces with their coordinates to make up the completed puzzle
   * @param {Object} game 
   */
  const generatePieceSequence = (game) => {

  	// The sequence of pieces as an array in cronological order
  	const sequence = [];

  	// Add pieces to the sequence until each rows is filled
  	for (let row = 0; row < game.rows;) {
  		
  		//console.log(`Processing row ${row}`);

  		// If the row is filled go to the next row
  		let done = game.rowIsFilled(row);
  		let piece = null;

  		//Add pieces untill the row is filled
  		while (!done) {

  			let piecePosition = false;
  			while (!piecePosition) {
  				// Get a random shape
  				let randomShape = getRandomShape();
  				
  				// Create a piece
  				piece = new Piece({
  					name: randomShape.name,
  					shape: randomShape.shape,
  					pixelSize: game.pixelSize,
  					image: game.image,
  				});
  				
  				piecePosition = game.getRandomSlot(row, piece);
  			}

  			// Normalize the shape matrix and add it to the game matrix so used pixes are set to 1
  			const normalizedShapedMatrix = normalizeShapeMatrix(
  				piece.shape,
  				piecePosition.row,
  				piecePosition.column,
  				game.matrix.rows,
  				game.matrix.columns
  			);
  			game.matrix = Matrix.add(game.matrix, normalizedShapedMatrix);

  			// Set piece coordinates and add it to the sequence
  			piece.setFinalCoordinates(piecePosition.column, piecePosition.row);
  			sequence.push(piece);

  			done = game.rowIsFilled(row);
  		}

  		// Once all the pixels on one row are filled, go to the next row
  		row++;
  	}

  	return sequence;
  };

  /**
   * Animate piece by piece until the entire puzzle is composed
   * @param {Game} game A game object
   * @param {Array} pieces A sequence of pieces that compose a puzzle
   * @param {number} speed Step duration in miliseconds
   */
  const animatePieces = (game, pieces, speed) => {
  	const interval = setInterval(() => {

  		const currentPiece = pieces.find(p => p.state !== 'Done');
  		// If all the pieces are done end the animation
  		if (!currentPiece) {
  			clearInterval(interval);
  			return
  		}

  		const currentX = currentPiece.currentCoordinates.getX();
  		const currentY = currentPiece.currentCoordinates.getY();
  		const finalX = currentPiece.finalCoordinates.getX();
  		const finalY = currentPiece.finalCoordinates.getY();
  		let nextX = currentX;
  		let nextY = currentY;


  		// Check if the piece is in the final position
  		if (currentX === finalX && currentY === finalY) {
  			currentPiece.state = 'Done';
  		}

  		if (currentPiece.state === 'Falling') {
  			if (nextX > finalX) { nextX--; }
  			if (nextX < finalX) { nextX++; }
  			if (nextY > finalY) { nextY--; }
  			currentPiece.setCurrentCoordinates(nextX, nextY);
  		}

  		// If the piece is Idle put it in the start position in the middle or the top row
  		if (currentPiece.state === 'Idle') {
  			game.$wrapper.append(currentPiece.$div);
  			currentPiece.setCurrentCoordinates(game.columns / 2, game.rows - 1);
  			currentPiece.state = 'Falling';
  		}

  	}, speed);

  };

  function tetrisify(selector, options) {

  	const $wrapper = document.querySelector(selector);
  	const $image = document.querySelector(selector + ' img');

  	if (!$wrapper) {
  		throw new Error('Tetrisify: Wrapper element not found.')
  	}

  	if (!$image) {
  		throw new Error('Tetrisify: Image not found inside the wrapper')
  	}

  	// Initialize the game
  	const game = new Game($wrapper, options);

  	// Generate a random sequence of pieces that form the puzzle
  	const pieces = generatePieceSequence(game);
  	
  	//Animate piece by piece until the puzzle is completed
  	animatePieces(game, pieces, 200);
  }

  return tetrisify;

}));
