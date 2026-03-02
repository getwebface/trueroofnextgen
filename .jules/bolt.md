
## 2025-03-02 - React Hook Rules Violation in Array.map Render Block
**Learning:** Using inline hooks (like `useState`) inside a loop or conditional block of a render function is a severe React Rules of Hooks violation. This was found in an `Array.from().map()` block calculating random values for rain particles. Not only is this a performance issue (recalculating/re-allocating hook arrays every render), but it also risks breaking React's internal hook state.
**Action:** When a static set of random values is needed across renders for an animation, compute them once at the top level of the component using `useMemo`, and map over the memoized array in the render output. This adheres to React rules and saves computation.
