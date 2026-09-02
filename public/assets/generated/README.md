# Generated Bureau art

The game code is wired to load optimized generated artwork from this directory.

Install the generated-art pack so these subfolders exist:

- `rooms/`
- `events/`
- `portraits/`
- `assets/`
- `directives/`
- `commendations/`
- `review/`

Only files referenced by the current interface are shipped here. Superseded concepts and source masters are retained outside `public`. The UI includes graceful fallbacks if an image is unavailable, but the intended presentation uses the generated files.

Animation is deliberately code-driven over static paintings: slow camera drift, lamp glow, mechanical nudges, paper drops, stamp impacts, score/gauge motion and existing apparatus animations. `prefers-reduced-motion` disables the ambient layer.
