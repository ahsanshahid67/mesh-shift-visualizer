"""
shiftLogic.py — Pure shift algorithm for circular q-shift on a 2D mesh.

This module contains no Flask dependencies and is independently testable.
"""

import math


def validate_inputs(p, q):
    """Validate that p is a perfect square (4–64) and q is in range [1, p-1]."""
    errors = []
    if not isinstance(p, int) or p < 4 or p > 64:
        errors.append("p must be an integer between 4 and 64.")
    else:
        sqrt_p = int(math.isqrt(p))
        if sqrt_p * sqrt_p != p:
            errors.append("p must be a perfect square (4, 9, 16, 25, 36, 49, 64).")
    if not isinstance(q, int) or q < 1 or (isinstance(p, int) and q >= p):
        errors.append(f"q must be an integer between 1 and {p - 1 if isinstance(p, int) and p >= 4 else '?'}.")
    return errors


def compute_shift(p, q):
    """
    Compute the circular q-shift on a √p × √p mesh.

    Returns a dict with:
      - sqrt_p: side length of the mesh
      - row_shift: q mod √p  (Stage 1)
      - col_shift: q // √p   (Stage 2)
      - initial: 2D list of initial node data
      - after_stage1: 2D list after row shift
      - final: 2D list after column shift
      - stage1_moves: list of {from_row, from_col, to_row, to_col, value}
      - stage2_moves: list of {from_row, from_col, to_row, to_col, value}
    """
    sqrt_p = int(math.isqrt(p))
    row_shift = q % sqrt_p
    col_shift = q // sqrt_p

    # Build initial grid: node i at position (i // sqrt_p, i % sqrt_p) holds data = i
    initial = [[r * sqrt_p + c for c in range(sqrt_p)] for r in range(sqrt_p)]

    # Stage 1 — Row Shift: each element in a row shifts right by row_shift positions
    after_stage1 = [[0] * sqrt_p for _ in range(sqrt_p)]
    stage1_moves = []
    for r in range(sqrt_p):
        for c in range(sqrt_p):
            new_c = (c + row_shift) % sqrt_p
            after_stage1[r][new_c] = initial[r][c]
            if row_shift != 0:
                stage1_moves.append({
                    "from_row": r, "from_col": c,
                    "to_row": r, "to_col": new_c,
                    "value": initial[r][c]
                })

    # Stage 2 — Column Shift: each element in a column shifts down by col_shift positions
    final = [[0] * sqrt_p for _ in range(sqrt_p)]
    stage2_moves = []
    for r in range(sqrt_p):
        for c in range(sqrt_p):
            new_r = (r + col_shift) % sqrt_p
            final[new_r][c] = after_stage1[r][c]
            if col_shift != 0:
                stage2_moves.append({
                    "from_row": r, "from_col": c,
                    "to_row": new_r, "to_col": c,
                    "value": after_stage1[r][c]
                })

    return {
        "sqrt_p": sqrt_p,
        "row_shift": row_shift,
        "col_shift": col_shift,
        "initial": initial,
        "after_stage1": after_stage1,
        "final": final,
        "stage1_moves": stage1_moves,
        "stage2_moves": stage2_moves,
    }


def compute_complexity(p, q):
    """
    Compute and compare mesh steps vs ring steps.

    Mesh steps  = (q mod √p) + ⌊q / √p⌋
    Ring steps  = min(q, p − q)
    """
    sqrt_p = int(math.isqrt(p))
    row_shift = q % sqrt_p
    col_shift = q // sqrt_p
    mesh_steps = row_shift + col_shift
    ring_steps = min(q, p - q)

    return {
        "p": p,
        "q": q,
        "sqrt_p": sqrt_p,
        "row_shift": row_shift,
        "col_shift": col_shift,
        "mesh_steps": mesh_steps,
        "ring_steps": ring_steps,
        "mesh_formula": f"({q} mod {sqrt_p}) + ⌊{q} / {sqrt_p}⌋ = {row_shift} + {col_shift} = {mesh_steps}",
        "ring_formula": f"min({q}, {p} − {q}) = min({q}, {p - q}) = {ring_steps}",
        "efficiency_gain": ring_steps - mesh_steps,
    }
