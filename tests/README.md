# Timeline tests

Install Node.js 22 or later, then run `npm test` in the project root.
No additional packages are required.

The tests exercise the current `controllers/TrackInteractionHandler.js` through
mouse handlers using a canvas stub. They cover all three track types, both resize
edges, movement, large pointer jumps, touching edges, unsorted track arrays,
independent tracks, zoom/scroll coordinates, returning the pointer, and source
boundaries including media shorter than 0.1 seconds.

Policy: resizing stops at neighbors. Moving a clip past a neighbor midpoint
(measured using the dragged clip center) swaps their order without overlap.
Swaps preserve durations and the gap between the pair. Large drags can cross
multiple neighbors; reversing the drag rebuilds from the original state.
Different track types may overlap in time. Touching endpoints are allowed.
Initial data must already
contain non-overlapping intervals; these tests do not cover importing invalid
states or real browser rendering.
