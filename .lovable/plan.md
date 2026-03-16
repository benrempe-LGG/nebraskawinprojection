

## Plan

### 1. Default Vegas O/U to 6.5
- In `Index.tsx`, change `vegasTotal` initial state from `""` to `"6.5"`
- Update the `useEffect`: if the API returns no result, keep the 6.5 default instead of leaving it empty
- The field remains fully editable as it already is

### 2. Add "Save as Image" / Screenshot Button
- Install `html2canvas` package
- Wrap the entire page content (header through summary cards) in a `ref`-targeted container
- Add a "Save as Image" button (camera/download icon) below the summary cards
- On click, use `html2canvas` to capture the container as a PNG and trigger a download
- Style the button to match the Husker theme (scarlet/gold)
- The captured area will include: header, schedule table, and summary cards — a clean shareable format suitable for message board posts

### Technical Details
- `html2canvas` renders the DOM to a canvas element, then we convert to a downloadable PNG blob
- The capture region will exclude the methodology section and footer to keep the image focused on the prediction data
- Button text: "📷 Save & Share" with a subtle card-style appearance

