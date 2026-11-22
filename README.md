# Homothety — an interactive 3D guide

A geometry project for grade 9: an interactive website that explains **homothety** (dilation) step by step, with a 3D scene you can turn around, a playground for your own figures, and ready-made presets. English and Uzbek.

## What's inside

**Learn**: a 10-step tutorial. Each step sets up and animates the scene:

1. What is a homothety? (centre O, ratio k)
2. The centre O
3. The rule for one point: OA′ = |k|·OA, vector form, and dragging A′ to change k
4. The image of a figure, with the coordinate formulas x′ = x₀ + k(x − x₀)
5. Enlargement and reduction
6. Negative ratio, central symmetry (k = −1), and why k ≠ 0
7. Properties: lengths ×|k|, area ×k², angles stay the same, lines map to parallel lines
8. How to find the centre from a figure and its image
9. Beyond the textbook: homothety in 3D space (volume ×|k|³)
10. Check yourself: a 6-question quiz

**Playground**
- Click to add vertices, place the centre O anywhere, and drag points.
- Drag a red image point along its line to change k directly.
- Change k with the slider, the number box or the quick chips. **Play** animates every point from k = 1 to the chosen k.
- A live **rule card** checks the formula on the selected point.
- A live **measurements card** shows distances from O, sides, perimeter, area and angles (or edges, surface and volume for solids), with their ratios.

**Presets**: 16 examples: enlargement, reduction, k = 3, central symmetry, negative k, centre at a vertex or inside the figure, finding the centre, a pentagon, a star, a cube, an hourglass, a pyramid and a star made of two tetrahedra.

**Settings**: language (EN / UZ), dark or light theme (light works better on a projector), snap to grid, step of k, decimal places, animation speed, image naming style (A′ or A₁), and grid on or off.

## Running it

Open it online through GitHub Pages (see below). To run it on your own computer, serve the folder with any static web server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Three.js is included in `lib/`, so the site works without internet, apart from the web font.

## Publishing on GitHub Pages

Repository **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**. The site will appear at `https://<username>.github.io/homothety/`.

## Controls

| Action | How |
|---|---|
| Rotate the camera | drag empty space |
| Zoom | mouse wheel / pinch |
| Pan | right-drag |
| Move a point or O | drag it |
| Change k by hand | drag a red point along its dashed line |
| Delete the selected point | Delete key |
| Play the animation | Space |
| Next / previous step (Learn) | → / ← |

## The maths

For a homothety with centre O and ratio k (k ≠ 0), each point A goes to the point A′ with

  **OA′ = k · OA** (as vectors), so **OA′ = |k| · OA** (as lengths).

In coordinates, with O = (x₀, y₀): x′ = x₀ + k(x − x₀), y′ = y₀ + k(y − y₀).

Built with [Three.js](https://threejs.org) (MIT licence, see `lib/THREE-LICENSE`).
