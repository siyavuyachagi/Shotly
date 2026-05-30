// src/assets/js/utils.js
var $ = (q, c = document) => c.querySelector(q);
var $$ = (q, c = document) => Array.from(c.querySelectorAll(q));
var once = (elem, evt) => new Promise((done) => elem.addEventListener(evt, done, { once: true }));
var redraw = (node) => node.clientHeight;
var setVar = (key, value, node = document.body) => node.style.setProperty("--" + key, value);
var calcTextWidth = (text) => {
  const div = document.body.appendChild(document.createElement("div"));
  div.classList.add("size-test");
  div.textContent = text;
  const width = div.clientWidth;
  div.remove();
  return width + 1 + "px";
};

// src/assets/js/code.js
var snippetNode = $("#snippet");
var setupLines = (node, config2) => {
  $$(":scope > br", node).forEach((row) => row.outerHTML = "<div>&nbsp;</div>");
  const rows = $$(":scope > div", node);
  setVar("line-number-width", calcTextWidth(rows.length + config2.startLine));
  rows.forEach((row, idx) => {
    const newRow = document.createElement("div");
    newRow.classList.add("line");
    row.replaceWith(newRow);
    if (config2.showLineNumbers) {
      const lineNum = document.createElement("div");
      lineNum.classList.add("line-number");
      lineNum.textContent = idx + 1 + config2.startLine;
      newRow.appendChild(lineNum);
    }
    const span = document.createElement("span");
    span.textContent = " ";
    row.appendChild(span);
    const lineCodeDiv = document.createElement("div");
    lineCodeDiv.classList.add("line-code");
    const lineCode = document.createElement("span");
    lineCode.innerHTML = row.innerHTML;
    lineCodeDiv.appendChild(lineCode);
    newRow.appendChild(lineCodeDiv);
  });
};
var stripInitialIndent = (node) => {
  const regIndent = /^\s+/u;
  const initialSpans = $$(":scope > div > span:first-child", node);
  if (initialSpans.some((span) => !regIndent.test(span.textContent))) return;
  const minIndent = Math.min(
    ...initialSpans.map((span) => span.textContent.match(regIndent)[0].length)
  );
  initialSpans.forEach((span) => span.textContent = span.textContent.slice(minIndent));
};
var getClipboardHtml = (clip) => {
  const html = clip.getData("text/html");
  if (html) return html;
  const text = clip.getData("text/plain").split("\n").map((line) => `<div>${line}</div>`).join("");
  return `<div>${text}</div>`;
};
var pasteCode = (config2, clipboard) => {
  snippetNode.innerHTML = getClipboardHtml(clipboard);
  const code = $("div", snippetNode);
  snippetNode.style.fontSize = code.style.fontSize;
  snippetNode.style.lineHeight = code.style.lineHeight;
  snippetNode.innerHTML = code.innerHTML;
  stripInitialIndent(snippetNode);
  setupLines(snippetNode, config2);
};

// node_modules/dom-to-image-even-more/src/dom-to-image-more.js
var util = newUtil();
var inliner = newInliner();
var fontFaces = newFontFaces();
var images = newImages();
var defaultOptions = {
  // Default is to fail on error, no placeholder
  imagePlaceholder: void 0,
  // Default cache bust is false, it will use the cache
  cacheBust: false,
  // Use (existing) authentication credentials for external URIs (CORS requests)
  useCredentials: false
};
var domtoimage = {
  toSvg,
  toPng,
  toJpeg,
  toBlob,
  toPixelData,
  toCanvas,
  impl: {
    fontFaces,
    images,
    util,
    inliner,
    options: {}
  }
};
function toSvg(node, options) {
  options = options || {};
  copyOptions(options);
  return Promise.resolve(node).then(function(node2) {
    return cloneNode(node2, options.filter, true);
  }).then((node2) => (options.postProcess && options.postProcess(node2), node2)).then(embedFonts).then(inlineImages).then(applyOptions).then(function(clone) {
    return makeSvgDataUri(
      clone,
      options.width || util.width(node),
      options.height || util.height(node)
    );
  });
  function applyOptions(clone) {
    if (options.bgcolor) clone.style.backgroundColor = options.bgcolor;
    if (options.width) clone.style.width = options.width + "px";
    if (options.height) clone.style.height = options.height + "px";
    if (options.style)
      Object.keys(options.style).forEach(function(property) {
        clone.style[property] = options.style[property];
      });
    return clone;
  }
}
function toPixelData(node, options) {
  return draw(node, options || {}).then(function(canvas) {
    return canvas.getContext("2d").getImageData(0, 0, util.width(node), util.height(node)).data;
  });
}
function toPng(node, options) {
  return draw(node, options || {}).then(function(canvas) {
    return canvas.toDataURL();
  });
}
function toJpeg(node, options) {
  options = options || {};
  return draw(node, options).then(function(canvas) {
    return canvas.toDataURL("image/jpeg", options.quality || 1);
  });
}
function toBlob(node, options) {
  return draw(node, options || {}).then(util.canvasToBlob);
}
function toCanvas(node, options) {
  return draw(node, options || {});
}
function copyOptions(options) {
  if (typeof options.imagePlaceholder === "undefined") {
    domtoimage.impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
  } else {
    domtoimage.impl.options.imagePlaceholder = options.imagePlaceholder;
  }
  if (typeof options.cacheBust === "undefined") {
    domtoimage.impl.options.cacheBust = defaultOptions.cacheBust;
  } else {
    domtoimage.impl.options.cacheBust = options.cacheBust;
  }
  if (typeof options.useCredentials === "undefined") {
    domtoimage.impl.options.useCredentials = defaultOptions.useCredentials;
  } else {
    domtoimage.impl.options.useCredentials = options.useCredentials;
  }
}
function draw(domNode, options) {
  return toSvg(domNode, options).then(util.makeImage).then(util.delay(100)).then(function(image) {
    const scale = typeof options.scale !== "number" ? 1 : options.scale;
    const canvas = newCanvas(domNode, scale);
    const ctx = canvas.getContext("2d");
    if (image) {
      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0);
    }
    return canvas;
  });
  function newCanvas(domNode2, scale) {
    const canvas = document.createElement("canvas");
    canvas.width = (options.width || util.width(domNode2)) * scale;
    canvas.height = (options.height || util.height(domNode2)) * scale;
    if (options.bgcolor) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = options.bgcolor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return canvas;
  }
}
function cloneNode(node, filter, root) {
  if (!root && filter && !filter(node)) return Promise.resolve();
  return Promise.resolve(node).then(makeNodeCopy).then(function(clone) {
    return cloneChildren(node, clone, filter);
  }).then(function(clone) {
    return processClone(node, clone);
  });
  function makeNodeCopy(node2) {
    if (node2 instanceof HTMLCanvasElement) return util.makeImage(node2.toDataURL());
    return node2.cloneNode(false);
  }
  function cloneChildren(original, clone, filter2) {
    const children = original.childNodes;
    if (children.length === 0) return Promise.resolve(clone);
    return cloneChildrenInOrder(clone, util.asArray(children), filter2).then(function() {
      return clone;
    });
    function cloneChildrenInOrder(parent, children2, filter3) {
      let done = Promise.resolve();
      children2.forEach(function(child) {
        done = done.then(function() {
          return cloneNode(child, filter3);
        }).then(function(childClone) {
          if (childClone) parent.appendChild(childClone);
        });
      });
      return done;
    }
  }
  function processClone(original, clone) {
    if (!(clone instanceof Element)) return clone;
    return Promise.resolve().then(cloneStyle).then(clonePseudoElements).then(copyUserInput).then(fixSvg).then(function() {
      return clone;
    });
    function cloneStyle() {
      copyStyle(window.getComputedStyle(original), clone.style);
      function copyFont(source, target) {
        target.font = source.font;
        target.fontFamily = source.fontFamily;
        target.fontFeatureSettings = source.fontFeatureSettings;
        target.fontKerning = source.fontKerning;
        target.fontSize = source.fontSize;
        target.fontStretch = source.fontStretch;
        target.fontStyle = source.fontStyle;
        target.fontVariant = source.fontVariant;
        target.fontVariantCaps = source.fontVariantCaps;
        target.fontVariantEastAsian = source.fontVariantEastAsian;
        target.fontVariantLigatures = source.fontVariantLigatures;
        target.fontVariantNumeric = source.fontVariantNumeric;
        target.fontVariationSettings = source.fontVariationSettings;
        target.fontWeight = source.fontWeight;
      }
      function copyStyle(source, target) {
        if (source.cssText) {
          target.cssText = source.cssText;
          copyFont(source, target);
        } else copyProperties(source, target);
        function copyProperties(source2, target2) {
          util.asArray(source2).forEach(function(name) {
            target2.setProperty(
              name,
              source2.getPropertyValue(name),
              source2.getPropertyPriority(name)
            );
          });
        }
      }
    }
    function clonePseudoElements() {
      [":before", ":after"].forEach(function(element) {
        clonePseudoElement(element);
      });
      function clonePseudoElement(element) {
        const style = window.getComputedStyle(original, element);
        const content = style.getPropertyValue("content");
        if (content === "" || content === "none") return;
        const className = util.uid();
        const currentClass = clone.getAttribute("class");
        if (currentClass) {
          clone.setAttribute("class", currentClass + " " + className);
        }
        const styleElement = document.createElement("style");
        styleElement.appendChild(formatPseudoElementStyle(className, element, style));
        clone.appendChild(styleElement);
        function formatPseudoElementStyle(className2, element2, style2) {
          const selector = "." + className2 + ":" + element2;
          const cssText = style2.cssText ? formatCssText(style2) : formatCssProperties(style2);
          return document.createTextNode(selector + "{" + cssText + "}");
          function formatCssText(style3) {
            const content2 = style3.getPropertyValue("content");
            return style3.cssText + " content: " + content2 + ";";
          }
          function formatCssProperties(style3) {
            return util.asArray(style3).map(formatProperty).join("; ") + ";";
            function formatProperty(name) {
              return name + ": " + style3.getPropertyValue(name) + (style3.getPropertyPriority(name) ? " !important" : "");
            }
          }
        }
      }
    }
    function copyUserInput() {
      if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
      if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
    }
    function fixSvg() {
      if (!(clone instanceof SVGElement)) return;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      if (!(clone instanceof SVGRectElement)) return;
      ["width", "height"].forEach(function(attribute) {
        const value = clone.getAttribute(attribute);
        if (!value) return;
        clone.style.setProperty(attribute, value);
      });
    }
  }
}
function embedFonts(node) {
  return fontFaces.resolveAll().then(function(cssText) {
    const styleNode = document.createElement("style");
    node.appendChild(styleNode);
    styleNode.appendChild(document.createTextNode(cssText));
    return node;
  });
}
function inlineImages(node) {
  return images.inlineAll(node).then(function() {
    return node;
  });
}
function makeSvgDataUri(node, width, height) {
  return Promise.resolve(node).then(function(node2) {
    node2.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    return new XMLSerializer().serializeToString(node2);
  }).then(util.escapeXhtml).then(function(xhtml) {
    return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + "</foreignObject>";
  }).then(function(foreignObject) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' + foreignObject + "</svg>";
  }).then(function(svg) {
    return "data:image/svg+xml;charset=utf-8," + svg;
  });
}
function newUtil() {
  return {
    escape,
    parseExtension,
    mimeType,
    dataAsUrl,
    isDataUrl,
    canvasToBlob,
    resolveUrl,
    getAndEncode,
    uid: uid(),
    delay,
    asArray,
    escapeXhtml,
    makeImage,
    width,
    height
  };
  function mimes() {
    const WOFF = "application/font-woff";
    const JPEG = "image/jpeg";
    return {
      woff: WOFF,
      woff2: WOFF,
      ttf: "application/font-truetype",
      eot: "application/vnd.ms-fontobject",
      png: "image/png",
      jpg: JPEG,
      jpeg: JPEG,
      gif: "image/gif",
      tiff: "image/tiff",
      svg: "image/svg+xml"
    };
  }
  function parseExtension(url) {
    const match = /\.([^./]*?)(\?|$)/gu.exec(url);
    if (match) return match[1];
    else return "";
  }
  function mimeType(url) {
    const extension = parseExtension(url).toLowerCase();
    return mimes()[extension] || "";
  }
  function isDataUrl(url) {
    return url.search(/^(data:)/u) !== -1;
  }
  function toBlob2(canvas) {
    return new Promise(function(resolve) {
      const binaryString = window.atob(canvas.toDataURL().split(",")[1]);
      const length = binaryString.length;
      const binaryArray = new Uint8Array(length);
      for (let i = 0; i < length; i++) binaryArray[i] = binaryString.charCodeAt(i);
      resolve(
        new Blob([binaryArray], {
          type: "image/png"
        })
      );
    });
  }
  function canvasToBlob(canvas) {
    if (canvas.toBlob)
      return new Promise(function(resolve) {
        canvas.toBlob(resolve);
      });
    return toBlob2(canvas);
  }
  function resolveUrl(url, baseUrl) {
    const doc = document.implementation.createHTMLDocument();
    const base = doc.createElement("base");
    doc.head.appendChild(base);
    const a = doc.createElement("a");
    doc.body.appendChild(a);
    base.href = baseUrl;
    a.href = url;
    return a.href;
  }
  function uid() {
    let index = 0;
    return function() {
      return "u" + fourRandomChars() + index++;
      function fourRandomChars() {
        return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
      }
    };
  }
  function makeImage(uri) {
    if (uri === "data:,") return Promise.resolve();
    return new Promise(function(resolve, reject) {
      const image = new Image();
      if (domtoimage.impl.options.useCredentials) {
        image.crossOrigin = "use-credentials";
      }
      image.onload = function() {
        resolve(image);
      };
      image.onerror = reject;
      image.src = uri;
    });
  }
  function getAndEncode(url) {
    const TIMEOUT = 3e4;
    if (domtoimage.impl.options.cacheBust) {
      url += (/\?/u.test(url) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime();
    }
    return new Promise(function(resolve) {
      const request = new XMLHttpRequest();
      request.onreadystatechange = done;
      request.ontimeout = timeout;
      request.responseType = "blob";
      request.timeout = TIMEOUT;
      if (domtoimage.impl.options.useCredentials) {
        request.withCredentials = true;
      }
      request.open("GET", url, true);
      request.send();
      let placeholder;
      if (domtoimage.impl.options.imagePlaceholder) {
        const split = domtoimage.impl.options.imagePlaceholder.split(/,/u);
        if (split && split[1]) {
          placeholder = split[1];
        }
      }
      function done() {
        if (request.readyState !== 4) return;
        if (request.status !== 200) {
          if (placeholder) {
            resolve(placeholder);
          } else {
            fail("cannot fetch resource: " + url + ", status: " + request.status);
          }
          return;
        }
        const encoder = new FileReader();
        encoder.onloadend = function() {
          const content = encoder.result.split(/,/u)[1];
          resolve(content);
        };
        encoder.readAsDataURL(request.response);
      }
      function timeout() {
        if (placeholder) {
          resolve(placeholder);
        } else {
          fail("timeout of " + TIMEOUT + "ms occurred while fetching resource: " + url);
        }
      }
      function fail(message) {
        console.error(message);
        resolve("");
      }
    });
  }
  function dataAsUrl(content, type) {
    return "data:" + type + ";base64," + content;
  }
  function escape(string) {
    return string.replace(/([.*+?^${}()|[\]/\\])/gu, "\\$1");
  }
  function delay(ms) {
    return function(arg) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve(arg);
        }, ms);
      });
    };
  }
  function asArray(arrayLike) {
    const array = [];
    const length = arrayLike.length;
    for (let i = 0; i < length; i++) array.push(arrayLike[i]);
    return array;
  }
  function escapeXhtml(string) {
    return string.replace(/#/gu, "%23").replace(/\n/gu, "%0A");
  }
  function width(node) {
    const leftBorder = px(node, "border-left-width");
    const rightBorder = px(node, "border-right-width");
    return node.scrollWidth + leftBorder + rightBorder;
  }
  function height(node) {
    const topBorder = px(node, "border-top-width");
    const bottomBorder = px(node, "border-bottom-width");
    return node.scrollHeight + topBorder + bottomBorder;
  }
  function px(node, styleProperty) {
    const value = window.getComputedStyle(node).getPropertyValue(styleProperty);
    return parseFloat(value.replace("px", ""));
  }
}
function newInliner() {
  const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/gu;
  return {
    inlineAll,
    shouldProcess,
    impl: {
      readUrls,
      inline
    }
  };
  function shouldProcess(string) {
    return string.search(URL_REGEX) !== -1;
  }
  function readUrls(string) {
    const result = [];
    let match;
    while ((match = URL_REGEX.exec(string)) !== null) {
      result.push(match[1]);
    }
    return result.filter(function(url) {
      return !util.isDataUrl(url);
    });
  }
  function inline(string, url, baseUrl, get) {
    return Promise.resolve(url).then(function(url2) {
      return baseUrl ? util.resolveUrl(url2, baseUrl) : url2;
    }).then(get || util.getAndEncode).then(function(data) {
      return util.dataAsUrl(data, util.mimeType(url));
    }).then(function(dataUrl) {
      return string.replace(urlAsRegex(url), "$1" + dataUrl + "$3");
    });
    function urlAsRegex(url2) {
      return new RegExp(`(url\\(['"]?)(` + util.escape(url2) + `)(['"]?\\))`, "gu");
    }
  }
  function inlineAll(string, baseUrl, get) {
    if (nothingToInline()) return Promise.resolve(string);
    return Promise.resolve(string).then(readUrls).then(function(urls) {
      let done = Promise.resolve(string);
      urls.forEach(function(url) {
        done = done.then(function(string2) {
          return inline(string2, url, baseUrl, get);
        });
      });
      return done;
    });
    function nothingToInline() {
      return !shouldProcess(string);
    }
  }
}
function newFontFaces() {
  return {
    resolveAll,
    impl: {
      readAll
    }
  };
  function resolveAll() {
    return readAll(document).then(function(webFonts) {
      return Promise.all(
        webFonts.map(function(webFont) {
          return webFont.resolve();
        })
      );
    }).then(function(cssStrings) {
      return cssStrings.join("\n");
    });
  }
  function readAll() {
    return Promise.resolve(util.asArray(document.styleSheets)).then(getCssRules).then(selectWebFontRules).then(function(rules) {
      return rules.map(newWebFont);
    });
    function selectWebFontRules(cssRules) {
      return cssRules.filter(function(rule) {
        return rule.type === CSSRule.FONT_FACE_RULE;
      }).filter(function(rule) {
        return inliner.shouldProcess(rule.style.getPropertyValue("src"));
      });
    }
    function getCssRules(styleSheets) {
      const cssRules = [];
      styleSheets.forEach(function(sheet) {
        try {
          util.asArray(sheet.cssRules || []).forEach(cssRules.push.bind(cssRules));
        } catch (e) {
          console.log("Error while reading CSS rules from " + sheet.href, e.toString());
        }
      });
      return cssRules;
    }
    function newWebFont(webFontRule) {
      return {
        resolve: function resolve() {
          const baseUrl = (webFontRule.parentStyleSheet || {}).href;
          return inliner.inlineAll(webFontRule.cssText, baseUrl);
        },
        src() {
          return webFontRule.style.getPropertyValue("src");
        }
      };
    }
  }
}
function newImages() {
  return {
    inlineAll,
    impl: {
      newImage
    }
  };
  function newImage(element) {
    return {
      inline
    };
    function inline(get) {
      if (util.isDataUrl(element.src)) return Promise.resolve();
      return Promise.resolve(element.src).then(get || util.getAndEncode).then(function(data) {
        return util.dataAsUrl(data, util.mimeType(element.src));
      }).then(function(dataUrl) {
        return new Promise(function(resolve) {
          element.onload = resolve;
          element.onerror = resolve;
          element.src = dataUrl;
        });
      });
    }
  }
  function inlineAll(node) {
    if (!(node instanceof Element)) return Promise.resolve(node);
    return inlineBackground(node).then(function() {
      if (node instanceof HTMLImageElement) return newImage(node).inline();
      else
        return Promise.all(
          util.asArray(node.childNodes).map(function(child) {
            return inlineAll(child);
          })
        );
    });
    function inlineBackground(node2) {
      const background = node2.style.getPropertyValue("background");
      if (!background) return Promise.resolve(node2);
      return inliner.inlineAll(background).then(function(inlined) {
        node2.style.setProperty(
          "background",
          inlined,
          node2.style.getPropertyPriority("background")
        );
      }).then(function() {
        return node2;
      });
    }
  }
}
var dom_to_image_more_default = domtoimage;

// src/assets/js/snap.js
var vscode = acquireVsCodeApi();
var windowNode = $("#window");
var snippetContainerNode = $("#snippet-container");
var flashFx = $("#flash-fx");
var SNAP_SCALE = 2;
var cameraFlashAnimation = async () => {
  flashFx.style.display = "block";
  redraw(flashFx);
  flashFx.style.opacity = "0";
  await once(flashFx, "transitionend");
  flashFx.style.display = "none";
  flashFx.style.opacity = "1";
};
var playShutterSound = (config2) => {
  const sound = document.querySelector("#shutter-sound");
  if (sound && config2.shutterSound !== false) {
    sound.currentTime = 0;
    sound.play().catch(() => {
    });
  }
};
var captureImage = async (config2) => {
  windowNode.style.resize = "none";
  if (config2.transparentBackground || config2.target === "window") {
    setVar("container-background-color", "transparent");
  }
  const target = config2.target === "container" ? snippetContainerNode : windowNode;
  const url = await dom_to_image_more_default.toPng(target, {
    bgColor: "transparent",
    scale: SNAP_SCALE,
    postProcess: (node) => {
      $$("#snippet-container, #snippet, .line, .line-code span", node).forEach(
        (span) => span.style.width = "unset"
      );
      $$(".line-code", node).forEach((span) => span.style.width = "100%");
    }
  });
  windowNode.style.resize = "horizontal";
  setVar("container-background-color", config2.backgroundColor);
  return url.slice(url.indexOf(",") + 1);
};
var takeSnap = async (config2) => {
  playShutterSound(config2);
  const data = await captureImage(config2);
  vscode.postMessage({ type: config2.shutterAction, data });
};
var copySnap = async (config2) => {
  const data = await captureImage(config2);
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  const blob = new Blob([array], { type: "image/png" });
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  cameraFlashAnimation();
};

// src/assets/js/index.js
var navbarNode = $("#navbar");
var windowControlsNode = $("#window-controls");
var windowTitleNode = $("#window-title");
var watermarkNode = document.querySelector("#watermark");
var btnSave = $("#save");
var btnCopy = $("#copy");
var config;
btnSave.addEventListener("click", () => takeSnap(config));
btnCopy.addEventListener("click", () => copySnap(config));
document.addEventListener("paste", (e) => pasteCode(config, e.clipboardData));
window.addEventListener("message", ({ data: { type, saveIconUri, copyIconUri, ...cfg } }) => {
  if (type === "update") {
    config = cfg;
    if (saveIconUri) document.querySelector("#save img").src = saveIconUri;
    if (copyIconUri) document.querySelector("#copy img").src = copyIconUri;
    const {
      fontLigatures,
      tabSize,
      backgroundColor,
      boxShadow,
      containerPadding,
      roundedCorners,
      showWindowControls,
      showWindowTitle,
      windowTitle,
      watermark
    } = config;
    setVar("ligatures", fontLigatures ? "normal" : "none");
    if (typeof fontLigatures === "string") setVar("font-features", fontLigatures);
    setVar("tab-size", tabSize);
    setVar("container-background-color", backgroundColor);
    setVar("box-shadow", boxShadow);
    setVar("container-padding", containerPadding);
    setVar("window-border-radius", roundedCorners ? "4px" : 0);
    navbarNode.hidden = !showWindowControls && !showWindowTitle && !watermark;
    windowControlsNode.hidden = !showWindowControls;
    windowTitleNode.hidden = !showWindowTitle;
    windowTitleNode.textContent = windowTitle;
    if (watermarkNode) watermarkNode.textContent = watermark || "";
    document.execCommand("paste");
  } else if (type === "flash") {
    cameraFlashAnimation();
  }
});
