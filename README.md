# Homothety

An interactive 3D app for learning homothety (dilation) in grade-9 geometry. It runs in the browser, in English or Uzbek.

## How it works

- **Viewport**: a 3D scene. Drag empty space to turn the camera, scroll to zoom, right-drag to pan.
- **Tool rail** (left): Move `V` · Add points `P` · Place centre `O` · Undo · Clear · Top view `T` · 3D view `3` · Fit `F` · Auto-rotate `R`.
- **k ruler** (bottom): drag it to set the ratio. It snaps to ½, 1, 2 and the other common values. You can also type k, or use the arrow keys. **▶** (or `Space`) animates every point from k = 1.
- **Inspector** (right): coordinates of O and the selected point, the rule worked out on that point (OA′ = |k|·OA and x′ = x₀ + k(x − x₀)), and a **ratios** table with live checks (distances and sides ×|k|, area ×k², angles unchanged, volume ×|k|³).
- **Drag a red point** along its dashed line to change k by hand.
- **Scenes**: 16 ready-made setups: enlargement, reduction, negative k, central symmetry, O at a vertex or inside the figure, finding the centre, a star, a cube, an hourglass and two tetrahedra.
- **Formulas**: a one-screen reference sheet.
- **Settings**: Paper or Night theme, grid snap, step of k, decimal places, animation speed, image naming (A′ or A₁).

## Tutorial

Press **Tutorial**. It also starts by itself on the first visit. It works like a game: it highlights what to press or drag, waits for you to do it, and then explains what happened in one line. It has 13 tasks and 3 challenges:

1. Drag the ruler to k = 2
2. Drag the centre O
3. Press Play
4. Set k = ½
5. Make k negative
6. Set k = −1 (central symmetry)
7. Drag A′: k follows your hand
8. Read the ratios
9. Pick the + tool
10. Click four points to build a shape
11. Put O inside it
12. Turn the camera
13. Load the cube from Scenes

Then come the challenges:

- **Challenge 1:** land the image on a dashed target (k = 3).
- **Challenge 2:** do it again (k = −½).
- **Challenge 3:** find the hidden centre. The lines through matching points cross at O.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Three.js is bundled in `lib/`, so the app works offline, apart from the web font.

## Publish

Repository **Settings → Pages → Deploy from a branch → `main` / root**. The site appears at `https://<username>.github.io/homothety/`.

Built with [Three.js](https://threejs.org) (MIT, see `lib/THREE-LICENSE`).
