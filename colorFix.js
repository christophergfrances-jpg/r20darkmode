function getRGBDistance(color1, color2) {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
}

function recurseChildren(children = []) {
  for (const child of children) {
    const style = window.getComputedStyle(child);
    if (child.hasChildNodes) {
      recurseChildren(child.childNodes);
    }
  }
}

function getRGBaFromString(color) {
  const [,rgba] = color.match(/\((.*?)\)/);
  return rgba.split(", ");
}

function searchAncestryForBGC(child) {
  const { parentElement: parent } = child;
  const bgStyle = self.getComputedStyle(parent);
  const rgba = getRGBaFromString(bgStyle.backgroundColor);
  if (rgba[3] == 0) {
    return searchAncestryForBGC(parent);
  } else {
    return rgba;
  }
}

const callback = () => {
  console.log("r20 colorFix is running");
  const messages = self.document.createTreeWalker(self.document.querySelector("#rightsidebar div.textchatcontainer"), NodeFilter.SHOW_TEXT);
  while (messages.nextNode()) {
    // get computed bg-color and color
    const { parentElement: element } = messages.currentNode;
    const style = self.getComputedStyle(element);
    const bgRGB = getRGBaFromString(style.backgroundColor);
    if (bgRGB[3] == 0) {
      // transparent background, ascend to find actual color
      const foundBG = searchAncestryForBGC(element);
      bgRGB[0] = foundBG[0];
      bgRGB[1] = foundBG[1];
      bgRGB[2] = foundBG[2];
    }
    const colorRGB = getRGBaFromString(style.color)
    // measure distance between bg-color and color
    const distance = getRGBDistance(bgRGB, colorRGB);
    if (distance < 50) {
      // if distance too great, make color be invert of bg-color
      const r = 255 - bgRGB[0];
      const g = 255 - bgRGB[1];
      const b = 255 - bgRGB[2];
      element.style.color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    }
  }
};

const observer = new MutationObserver(callback);
(() => {
  observer.observe(document.querySelector("#rightsidebar div.textchatcontainer"), {
    attributes: true,
    childList: true,
    subtree: true,
  });
})();

// observer.disconnect();