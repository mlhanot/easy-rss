
// Usage: addEventListener("click",createMultiSelect,true);
// Classes used: selected, last_selected, shift_select_basis
function createMultiSelect(event: MouseEvent) {
  const root = event.currentTarget as Element;
  const options = Array.from(root.children);
  const targetInd = options.findIndex((el) => el.contains(event.target as Element));
  if (targetInd < 0) {
    console.log("Failed to find click target");
    return;
  }
  const target = options[targetInd];
  // Update history data
  root.querySelectorAll(".last_selected").forEach(
    (el)=>el.classList.remove("last_selected"));
  target.classList.add("last_selected");
  if (event.shiftKey) {
    // Define a shift basis if this is the first click
    if (root.querySelectorAll(".shift_select_basis").length === 0) {
      target.classList.add(".shift_select_basis");
    }
  } else {
    // The basis element for shift operations is updated only when shift is not pressed
    root.querySelectorAll(".shift_select_basis").forEach(
      (el)=>el.classList.remove("shift_select_basis"));
    target.classList.add("shift_select_basis");
  }
  // Update selection
  if (event.shiftKey) {
    const shiftInd = options.findIndex((el) => el.classList.contains("shift_select_basis"));
    const lI = Math.min(shiftInd,targetInd);
    const rI = Math.max(shiftInd,targetInd);
    for (let i = lI; i <= rI; i++) {
      options[i].classList.add("selected");
    }
    if (!event.ctrlKey) { 
      // If ctrl is hold keep the others previously selected element, else discard them
      for (let i = 0; i < lI; i++) {
        options[i].classList.remove("selected");
      }
      for (let i = rI+1; i < options.length; i++) {
        options[i].classList.remove("selected");
      }
    }
  } else if (event.ctrlKey) { // ctrl, toggle target without affecting others
    target.classList.toggle("selected");
  } else { // no modifier, deselect everything except target
    options.forEach((el)=>el.classList.remove("selected"));
    target.classList.add("selected");
  }
}

export { createMultiSelect };

