/**
 * Custom function to mimic unavailable Object.entries function
 * @param {} obj 
 * @returns 
 */
function objectEntries(obj) {
  var result = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push([key, obj[key]]);
    }
  }
  return result;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function (d, b) {
  extendStatics =
    Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array &&
      function (d, b) {
        d.__proto__ = b;
      }) ||
    function (d, b) {
      for (var p in b)
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== 'function' && b !== null)
    throw new TypeError(
      'Class extends value ' + String(b) + ' is not a constructor or null'
    );
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype =
    b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
}

var __assign = function () {
  __assign =
    Object.assign ||
    function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
};

typeof SuppressedError === 'function'
  ? SuppressedError
  : function (error, suppressed, message) {
      var e = new Error(message);
      return (
        (e.name = 'SuppressedError'),
        (e.error = error),
        (e.suppressed = suppressed),
        e
      );
    };

var MarkType;
(function (MarkType) {
  MarkType['BOLD'] = 'bold';
  MarkType['ITALIC'] = 'italic';
  MarkType['UNDERLINE'] = 'underline';
  MarkType['CLASSNAME_OR_ID'] = 'classnameOrId';
  MarkType['STRIKE_THROUGH'] = 'strikethrough';
  MarkType['INLINE_CODE'] = 'inlineCode';
  MarkType['SUBSCRIPT'] = 'subscript';
  MarkType['SUPERSCRIPT'] = 'superscript';
  MarkType['BREAK'] = 'break';
})(MarkType || (MarkType = {}));
var MarkType$1 = MarkType;

var NodeType;
(function (NodeType) {
  NodeType['DOCUMENT'] = 'doc';
  NodeType['PARAGRAPH'] = 'p';
  NodeType['LINK'] = 'a';
  NodeType['IMAGE'] = 'img';
  NodeType['EMBED'] = 'embed';
  NodeType['HEADING_1'] = 'h1';
  NodeType['HEADING_2'] = 'h2';
  NodeType['HEADING_3'] = 'h3';
  NodeType['HEADING_4'] = 'h4';
  NodeType['HEADING_5'] = 'h5';
  NodeType['HEADING_6'] = 'h6';
  NodeType['ORDER_LIST'] = 'ol';
  NodeType['UNORDER_LIST'] = 'ul';
  NodeType['LIST_ITEM'] = 'li';
  NodeType['FRAGMENT'] = 'fragment';
  NodeType['HR'] = 'hr';
  NodeType['TABLE'] = 'table';
  NodeType['TABLE_HEADER'] = 'thead';
  NodeType['TABLE_BODY'] = 'tbody';
  NodeType['TABLE_FOOTER'] = 'tfoot';
  NodeType['TABLE_ROW'] = 'tr';
  NodeType['TABLE_HEAD'] = 'th';
  NodeType['TABLE_DATA'] = 'td';
  NodeType['COL_GROUP'] = 'colgroup';
  NodeType['COL'] = 'col';
  NodeType['BLOCK_QUOTE'] = 'blockquote';
  NodeType['CODE'] = 'code';
  NodeType['TEXT'] = 'text';
  NodeType['REFERENCE'] = 'reference';
})(NodeType || (NodeType = {}));
var NodeType$1 = NodeType;

function sanitizeHTML(input, allowedTags, allowedAttributes) {
  if (allowedTags === void 0) {
    allowedTags = [
      'p',
      'a',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'sub',
      'u',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'span',
      'fragment',
      'sup',
      'strike',
      'br',
      'img',
      'colgroup',
      'col',
      'div',
    ];
  }
  if (allowedAttributes === void 0) {
    allowedAttributes = [
      'href',
      'title',
      'target',
      'alt',
      'src',
      'class',
      'id',
      'style',
      'colspan',
      'rowspan',
      'content-type-uid',
      'data-sys-asset-uid',
      'sys-style-type',
      'data-type',
      'data-width',
      'data-rows',
      'data-cols',
      'data-mtec',
    ];
  }
  // Replace newline characters with <br /> before processing the HTML tags
  input = input.replace(/\n/g, '<br />');
  // Regular expression to find and remove all HTML tags except the allowed ones
  var sanitized = input.replace(
    /<\/?([a-z][a-z0-9]*)\b[^<>]*>/gi,
    function (match, tag) {
      return allowedTags.includes(tag.toLowerCase()) ? match : '';
    }
  );
  // Regular expression to remove all attributes except the allowed ones
  var cleaned = sanitized.replace(
    /<([a-z][a-z0-9]*)\b[^<>]*>/gi,
    function (match, tag) {
      if (!allowedTags.includes(tag.toLowerCase())) {
        return match; // Ignore tags not in allowedTags
      }
      // For each tag that is allowed, clean its attributes
      return match.replace(
        /\s([a-z\-]+)=['"][^'"]*['"]/gi,
        function (attributeMatch, attribute) {
          return allowedAttributes.includes(attribute.toLowerCase())
            ? attributeMatch
            : '';
        }
      );
    }
  );
  return cleaned;
}

var _a$1;
var defaultNodeOption =
  ((_a$1 = {}),
  (_a$1[NodeType$1.DOCUMENT] = function (node) {
    return '';
  }),
  (_a$1[NodeType$1.PARAGRAPH] = function (node, next) {
    return '<p'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</p>');
  }),
  (_a$1[NodeType$1.LINK] = function (node, next) {
    var sanitizedHref = sanitizeHTML(node.attrs.href || node.attrs.url);
    if (node.attrs.target) {
      return '<a'
        .concat(
          node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : ''
        )
        .concat(
          node.attrs['class-name']
            ? ' class="'.concat(node.attrs['class-name'], '"')
            : ''
        )
        .concat(
          node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '',
          ' href="'
        )
        .concat(sanitizedHref, '" target="')
        .concat(node.attrs.target, '">')
        .concat(sanitizeHTML(next(node.children)), '</a>');
    }
    return '<a'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(
        node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '',
        ' href="'
      )
      .concat(sanitizedHref, '">')
      .concat(sanitizeHTML(next(node.children)), '</a>');
  }),
  (_a$1[NodeType$1.IMAGE] = function (node, next) {
    var sanitizedSrc = encodeURI(
      sanitizeHTML(node.attrs.src || node.attrs.url)
    );
    return '<img'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', ' src="')
      .concat(sanitizedSrc, '" />')
      .concat(sanitizeHTML(next(node.children)));
  }),
  (_a$1[NodeType$1.EMBED] = function (node, next) {
    var sanitizedSrc = encodeURI(
      sanitizeHTML(node.attrs.src || node.attrs.url)
    );
    return '<iframe'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', ' src="')
      .concat(sanitizedSrc, '">')
      .concat(sanitizeHTML(next(node.children)), '</iframe>');
  }),
  (_a$1[NodeType$1.HEADING_1] = function (node, next) {
    return '<h1'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</h1>');
  }),
  (_a$1[NodeType$1.HEADING_2] = function (node, next) {
    return '<h2'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</h2>');
  }),
  (_a$1[NodeType$1.HEADING_3] = function (node, next) {
    return '<h3'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</h3>');
  }),
  (_a$1[NodeType$1.HEADING_4] = function (node, next) {
    return '<h4'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</h4>');
  }),
  (_a$1[NodeType$1.HEADING_5] = function (node, next) {
    return '<h5'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</h5>');
  }),
  (_a$1[NodeType$1.HEADING_6] = function (node, next) {
    return '<h6'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</h6>');
  }),
  (_a$1[NodeType$1.ORDER_LIST] = function (node, next) {
    return '<ol'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</ol>');
  }),
  (_a$1[NodeType$1.FRAGMENT] = function (node, next) {
    return '<fragment>'.concat(
      sanitizeHTML(next(node.children)),
      '</fragment>'
    );
  }),
  (_a$1[NodeType$1.UNORDER_LIST] = function (node, next) {
    return '<ul'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</ul>');
  }),
  (_a$1[NodeType$1.LIST_ITEM] = function (node, next) {
    return '<li'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</li>');
  }),
  (_a$1[NodeType$1.HR] = function (node, next) {
    return '<hr>';
  }),
  (_a$1[NodeType$1.TABLE] = function (node, next) {
    // Generate colgroup if colWidths attribute is present
    var colgroupHTML = '';
    if (node.attrs.colWidths && Array.isArray(node.attrs.colWidths)) {
      var totalWidth_1 = node.attrs.colWidths.reduce(function (sum, width) {
        return sum + width;
      }, 0);
      colgroupHTML = '<'
        .concat(NodeType$1.COL_GROUP, ' data-width="')
        .concat(totalWidth_1, '">');
      node.attrs.colWidths.forEach(function (colWidth) {
        var widthPercentage = (colWidth / totalWidth_1) * 100;
        colgroupHTML += '<'
          .concat(NodeType$1.COL, ' style="width:')
          .concat(widthPercentage.toFixed(2), '%"/>');
      });
      colgroupHTML += '</'.concat(NodeType$1.COL_GROUP, '>');
    }
    // Generate table with colgroup and other attributes
    return (
      '<table'.concat(
        node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : ''
      ) +
      ''.concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      ) +
      ''.concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>') +
      ''.concat(colgroupHTML) +
      ''.concat(sanitizeHTML(next(node.children))) +
      '</table>'
    );
  }),
  (_a$1[NodeType$1.TABLE_HEADER] = function (node, next) {
    return '<thead'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</thead>');
  }),
  (_a$1[NodeType$1.TABLE_BODY] = function (node, next) {
    return '<tbody'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</tbody>');
  }),
  (_a$1[NodeType$1.TABLE_FOOTER] = function (node, next) {
    return '<tfoot'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</tfoot>');
  }),
  (_a$1[NodeType$1.TABLE_ROW] = function (node, next) {
    return '<tr'
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</tr>');
  }),
  (_a$1[NodeType$1.TABLE_HEAD] = function (node, next) {
    if (node.attrs.void) return '';
    return (
      '<th' +
      ''.concat(
        node.attrs.rowSpan ? ' rowspan="'.concat(node.attrs.rowSpan, '"') : ''
      ) +
      ''.concat(
        node.attrs.colSpan ? ' colspan="'.concat(node.attrs.colSpan, '"') : ''
      ) +
      ''.concat(
        node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : ''
      ) +
      ''.concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      ) +
      ''
        .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
        .concat(sanitizeHTML(next(node.children))) +
      '</th>'
    );
  }),
  (_a$1[NodeType$1.TABLE_DATA] = function (node, next) {
    if (node.attrs.void) return '';
    return (
      '<td' +
      ''.concat(
        node.attrs.rowSpan ? ' rowspan="'.concat(node.attrs.rowSpan, '"') : ''
      ) +
      ''.concat(
        node.attrs.colSpan ? ' colspan="'.concat(node.attrs.colSpan, '"') : ''
      ) +
      ''.concat(
        node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : ''
      ) +
      ''.concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      ) +
      ''
        .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
        .concat(sanitizeHTML(next(node.children))) +
      '</td>'
    );
  }),
  (_a$1[NodeType$1.BLOCK_QUOTE] = function (node, next) {
    return '<blockquote'
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</blockquote>');
  }),
  (_a$1[NodeType$1.CODE] = function (node, next) {
    return '<code'
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '', '>')
      .concat(sanitizeHTML(next(node.children)), '</code>');
  }),
  (_a$1['reference'] = function (node, next) {
    var _a, _b, _c, _d, _e;
    if (
      (node.attrs.type === 'entry' || node.attrs.type === 'asset') &&
      node.attrs['display-type'] === 'link'
    ) {
      var aTagAttrs = ''
        .concat(
          node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : ''
        )
        .concat(
          node.attrs['class-name']
            ? ' class="'.concat(node.attrs['class-name'], '"')
            : ''
        )
        .concat(
          node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '',
          ' href="'
        )
        .concat(node.attrs.href || node.attrs.url, '"');
      if (node.attrs.target) {
        aTagAttrs += ' target="'.concat(node.attrs.target, '"');
      }
      if (node.attrs.type == 'asset') {
        aTagAttrs += ' type="asset" content-type-uid="sys_assets" '.concat(
          node.attrs['asset-uid']
            ? 'data-sys-asset-uid="'.concat(node.attrs['asset-uid'], '"')
            : '',
          ' sys-style-type="download"'
        );
      }
      var aTag = '<a'
        .concat(aTagAttrs, '>')
        .concat(sanitizeHTML(next(node.children)), '</a>');
      return aTag;
    }
    if (node.attrs.type === 'asset') {
      var src = encodeURI(node.attrs['asset-link']);
      var alt =
        (_b =
          (_a = node.attrs) === null || _a === void 0
            ? void 0
            : _a['redactor-attributes']) === null || _b === void 0
          ? void 0
          : _b['alt'];
      var link = node.attrs.link;
      var target = node.attrs.target || '';
      var caption =
        ((_d =
          (_c = node.attrs) === null || _c === void 0
            ? void 0
            : _c['redactor-attributes']) === null || _d === void 0
          ? void 0
          : _d['asset-caption']) ||
        ((_e = node.attrs) === null || _e === void 0
          ? void 0
          : _e['asset-caption']) ||
        '';
      var style = node.attrs.style;
      var asset_uid = node.attrs['asset-uid'];
      var imageTag = '<img'
        .concat(asset_uid ? ' asset_uid="'.concat(asset_uid, '"') : '')
        .concat(
          node.attrs['class-name']
            ? ' class="'.concat(sanitizeHTML(node.attrs['class-name']), '"')
            : ''
        )
        .concat(src ? ' src="'.concat(sanitizeHTML(src), '"') : '')
        .concat(alt ? ' alt="'.concat(alt, '"') : '')
        .concat(target === '_blank' ? ' target="_blank"' : '')
        .concat(style ? ' style="'.concat(style, '"') : '', ' />');
      return (
        '<figure'.concat(style ? ' style="'.concat(style, '"') : '', '>') +
        (link
          ? '<a href="'.concat(link, '" target="').concat(target || '', '">')
          : '') +
        imageTag +
        (link ? '</a>' : '') +
        (caption ? '<figcaption>'.concat(caption, '</figcaption>') : '') +
        '</figure>'
      );
    }
    return '';
  }),
  (_a$1['default'] = function (node, next) {
    return sanitizeHTML(next(node.children));
  }),
  (_a$1[MarkType$1.BOLD] = function (text) {
    return '<strong>'.concat(sanitizeHTML(text), '</strong>');
  }),
  (_a$1[MarkType$1.ITALIC] = function (text) {
    return '<em>'.concat(sanitizeHTML(text), '</em>');
  }),
  (_a$1[MarkType$1.UNDERLINE] = function (text) {
    return '<u>'.concat(sanitizeHTML(text), '</u>');
  }),
  (_a$1[MarkType$1.STRIKE_THROUGH] = function (text) {
    return '<strike>'.concat(sanitizeHTML(text), '</strike>');
  }),
  (_a$1[MarkType$1.INLINE_CODE] = function (text) {
    return '<span data-type=\'inlineCode\'>'.concat(
      sanitizeHTML(text),
      '</span>'
    );
  }),
  (_a$1[MarkType$1.SUBSCRIPT] = function (text) {
    return '<sub>'.concat(sanitizeHTML(text), '</sub>');
  }),
  (_a$1[MarkType$1.SUPERSCRIPT] = function (text) {
    return '<sup>'.concat(sanitizeHTML(text), '</sup>');
  }),
  (_a$1[MarkType$1.BREAK] = function (text) {
    return '<br />'.concat(sanitizeHTML(text));
  }),
  (_a$1[MarkType$1.CLASSNAME_OR_ID] = function (text, classname, id) {
    return '<span'
      .concat(classname ? ' class="'.concat(classname, '"') : '')
      .concat(id ? ' id="'.concat(id, '"') : '', '>')
      .concat(sanitizeHTML(text), '</span>');
  }),
  _a$1);

var StyleType;
(function (StyleType) {
  StyleType['BLOCK'] = 'block';
  StyleType['INLINE'] = 'inline';
  StyleType['LINK'] = 'link';
  StyleType['DISPLAY'] = 'display';
  StyleType['DOWNLOAD'] = 'download';
})(StyleType || (StyleType = {}));
var StyleType$1 = StyleType;

var _a;
var defaultOptions =
  ((_a = {}),
  (_a[StyleType$1.BLOCK] = function (item) {
    var title = sanitizeHTML(item.title || item.uid);
    var content_type_uid = sanitizeHTML(
      item._content_type_uid ||
        (item.system ? item.system.content_type_uid : '')
    );
    return '<div><p>'
      .concat(title, '</p><p>Content type: <span>')
      .concat(content_type_uid, '</span></p></div>');
  }),
  (_a[StyleType$1.INLINE] = function (item) {
    var title = sanitizeHTML(item.title || item.uid);
    return '<span>'.concat(title, '</span>');
  }),
  (_a[StyleType$1.LINK] = function (item, metadata) {
    var url = encodeURI(sanitizeHTML(item.url || 'undefined'));
    var text = sanitizeHTML(
      metadata.text ||
        item.title ||
        item.uid ||
        (item.system ? item.system.uid : '')
    );
    return '<a href="'.concat(url, '">').concat(text, '</a>');
  }),
  (_a[StyleType$1.DISPLAY] = function (item, metadata) {
    var url = encodeURI(sanitizeHTML(item.url || 'undefined'));
    var alt = sanitizeHTML(
      metadata.attributes.alt ||
        item.title ||
        item.filename ||
        item.uid ||
        (item.system ? item.system.uid : '')
    );
    return '<img src="'.concat(url, '" alt="').concat(alt, '" />');
  }),
  (_a[StyleType$1.DOWNLOAD] = function (item, metadata) {
    var href = encodeURI(sanitizeHTML(item.url || 'undefined'));
    var text = sanitizeHTML(
      metadata.text ||
        item.title ||
        item.uid ||
        (item.system ? item.system.content_type_uid : '')
    );
    return '<a href="'.concat(href, '">').concat(text, '</a>');
  }),
  _a);

// This function will find Embedded object present in string
function findEmbeddedEntry(uid, contentTypeUid, embeddeditems) {
  if (embeddeditems === void 0) {
    embeddeditems = [];
  }
  return embeddeditems.filter(function (entry) {
    if (
      (entry.uid &&
        entry.uid === uid &&
        entry._content_type_uid === contentTypeUid) ||
      (entry.system &&
        entry.system.uid === uid &&
        entry.system.content_type_uid === contentTypeUid)
    ) {
      return entry;
    }
  });
}
function findEmbeddedAsset(uid, embeddedAssets) {
  if (embeddedAssets === void 0) {
    embeddedAssets = [];
  }
  return embeddedAssets.filter(function (asset) {
    if (
      (asset.uid && asset.uid === uid) ||
      (asset.system && asset.system.uid === uid)
    ) {
      return asset;
    }
  });
}
function findGQLEmbeddedItems(metadata, items) {
  if (metadata.itemType === 'entry') {
    return findEmbeddedEntry(metadata.itemUid, metadata.contentTypeUid, items);
  } else {
    return findEmbeddedAsset(metadata.itemUid, items);
  }
}
function findEmbeddedItems(object, entry) {
  if (object && object !== undefined && entry && entry !== undefined) {
    if (entry._embedded_items !== undefined) {
      var entryEmbedable = entry;
      var items = Object.values(entryEmbedable._embedded_items || []).reduce(
        function (accumulator, value) {
          return accumulator.concat(value);
        },
        []
      );
      return findGQLEmbeddedItems(object, items);
    }
  }
  return [];
}
function findRenderString(item, metadata, renderOptions) {
  if ((!item && item === undefined) || (!metadata && metadata === undefined)) {
    return '';
  }
  if (renderOptions && renderOptions[metadata.styleType] !== undefined) {
    var renderFunction = renderOptions[metadata.styleType];
    if (
      metadata.attributes['data-sys-content-type-uid'] !== undefined &&
      typeof renderFunction !== 'function' &&
      renderFunction[metadata.attributes['data-sys-content-type-uid']] !==
        undefined
    ) {
      return renderFunction[metadata.attributes['data-sys-content-type-uid']](
        item,
        metadata
      );
    } else if (
      metadata.attributes['data-sys-content-type-uid'] !== undefined &&
      typeof renderFunction !== 'function' &&
      renderFunction.$default !== undefined
    ) {
      return renderFunction.$default(item, metadata);
    } else if (
      metadata.contentTypeUid !== undefined &&
      typeof renderFunction !== 'function' &&
      renderFunction[metadata.contentTypeUid] !== undefined
    ) {
      return renderFunction[metadata.contentTypeUid](item, metadata);
    } else if (
      metadata.contentTypeUid !== undefined &&
      typeof renderFunction !== 'function' &&
      renderFunction.$default !== undefined
    ) {
      return renderFunction.$default(item, metadata);
    } else if (typeof renderFunction === 'function') {
      return renderFunction(item, metadata);
    }
  }
  var defaultRenderFunction = defaultOptions[metadata.styleType];
  return defaultRenderFunction(item, metadata);
}

function enumerate(entries, process) {
  for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
    var entry = entries_1[_i];
    process(entry);
  }
}
function enumerateContents(content, renderOption, renderEmbed) {
  if (!(content instanceof Array) && content.type !== 'doc') {
    return content;
  }
  if (content instanceof Array) {
    var result_1 = [];
    content.forEach(function (doc) {
      result_1.push(enumerateContents(doc, renderOption, renderEmbed));
    });
    return result_1;
  }
  var commonRenderOption = __assign(
    __assign({}, defaultNodeOption),
    renderOption
  );
  return nodeChildrenToHTML(content.children, commonRenderOption, renderEmbed);
}
function textNodeToHTML(node, renderOption) {
  var text = replaceHtmlEntities(node.text);
  if (node.classname || node.id) {
    text = renderOption[MarkType$1.CLASSNAME_OR_ID](
      text,
      node.classname,
      node.id
    );
  }
  if (node.break) {
    text = renderOption[MarkType$1.BREAK](text);
  }
  if (node.superscript) {
    text = renderOption[MarkType$1.SUPERSCRIPT](text);
  }
  if (node.subscript) {
    text = renderOption[MarkType$1.SUBSCRIPT](text);
  }
  if (node.inlineCode) {
    text = renderOption[MarkType$1.INLINE_CODE](text);
  }
  if (node.strikethrough) {
    text = renderOption[MarkType$1.STRIKE_THROUGH](text);
  }
  if (node.underline) {
    text = renderOption[MarkType$1.UNDERLINE](text);
  }
  if (node.italic) {
    text = renderOption[MarkType$1.ITALIC](text);
  }
  if (node.bold) {
    text = renderOption[MarkType$1.BOLD](text);
  }
  return text;
}
function referenceToHTML(node, renderOption, renderEmbed) {
  function sendToRenderOption(referenceNode) {
    var next = function (nodes) {
      return nodeChildrenToHTML(nodes, renderOption, renderEmbed);
    };
    return renderOption[referenceNode.type](referenceNode, next);
  }
  if (
    (node.attrs.type === 'entry' || node.attrs.type === 'asset') &&
    node.attrs['display-type'] === 'link'
  ) {
    var entryText = node.children
      ? nodeChildrenToHTML(node.children, renderOption, renderEmbed)
      : '';
    if (renderOption[node.type] !== undefined) {
      return sendToRenderOption(node);
    }
    var aTagAttrs = ''
      .concat(node.attrs.style ? ' style="'.concat(node.attrs.style, '"') : '')
      .concat(
        node.attrs['class-name']
          ? ' class="'.concat(node.attrs['class-name'], '"')
          : ''
      )
      .concat(
        node.attrs.id ? ' id="'.concat(node.attrs.id, '"') : '',
        ' href="'
      )
      .concat(node.attrs.href || node.attrs.url, '"');
    if (node.attrs.target) {
      aTagAttrs += ' target="'.concat(node.attrs.target, '"');
    }
    if (node.attrs.type == 'asset') {
      aTagAttrs += ' type="asset" content-type-uid="sys_assets" '.concat(
        node.attrs['asset-uid']
          ? 'data-sys-asset-uid="'.concat(node.attrs['asset-uid'], '"')
          : '',
        ' sys-style-type="download"'
      );
    }
    var aTag = '<a'.concat(aTagAttrs, '>').concat(entryText, '</a>');
    return aTag;
  }
  if (!renderEmbed && renderOption[node.type] !== undefined) {
    return sendToRenderOption(node);
  }
  if (!renderEmbed) {
    return '';
  }
  var metadata = nodeToMetadata(
    node.attrs,
    node.children && node.children.length > 0 ? node.children[0] : {}
  );
  var item = renderEmbed(metadata);
  if (!item && renderOption[node.type] !== undefined) {
    return sendToRenderOption(node);
  }
  return findRenderString(item, metadata, renderOption);
}
function nodeChildrenToHTML(nodes, renderOption, renderEmbed) {
  return nodes
    .map(function (node) {
      return nodeToHTML(node, renderOption, renderEmbed);
    })
    .join('');
}
function styleObjectToString(styleObj) {
  if (!styleObj) return '';
  if (typeof styleObj === 'string') {
    return styleObj;
  }
  var styleString = '';
  for (var key in styleObj) {
    if (styleObj.hasOwnProperty(key)) {
      var value = styleObj[key];
      styleString += ''.concat(key, ':').concat(value, ';');
    }
  }
  return styleString;
}
function nodeToHTML(node, renderOption, renderEmbed) {
  var _a;
  if (
    (_a = node === null || node === void 0 ? void 0 : node.attrs) === null ||
    _a === void 0
      ? void 0
      : _a.style
  ) {
    node.attrs.style = styleObjectToString(node.attrs.style);
  }
  if (!node.type) {
    return textNodeToHTML(node, renderOption);
  } else if (node.type === 'reference') {
    return referenceToHTML(node, renderOption, renderEmbed);
  } else {
    var next = function (nodes) {
      return nodeChildrenToHTML(nodes, renderOption, renderEmbed);
    };
    if (renderOption[node.type] !== undefined) {
      return renderOption[node.type](node, next);
    } else {
      return renderOption.default(node, next);
    }
  }
}
function replaceHtmlEntities(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
var forbiddenAttrChars = ['"', '\'', '>', '<', '/', '='];

function createMetadata(attribute) {
  return {
    text: attribute['#text'],
    itemUid: attribute['data-sys-entry-uid'] || attribute['data-sys-asset-uid'],
    itemType: attribute.type,
    styleType: attribute['sys-style-type'],
    attributes: attribute,
    contentTypeUid: attribute['data-sys-content-type-uid'],
  };
}
function nodeToMetadata(attribute, textNode) {
  return {
    text: textNode.text,
    itemUid: attribute['entry-uid'] || attribute['asset-uid'],
    itemType: attribute.type,
    styleType: attribute['display-type'],
    attributes: attribute,
    contentTypeUid: attribute['content-type-uid'],
  };
}
function attributeToString(attributes) {
  var result = '';
  var _loop_1 = function (key) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      if (
        forbiddenAttrChars.some(function (char) {
          return key.includes(char);
        })
      ) {
        return 'continue';
      }
      var value = attributes[key];
      if (Array.isArray(value)) {
        value = value.join(', ');
      } else if (typeof value === 'object') {
        var elementString = '';
        for (var subKey in value) {
          if (Object.prototype.hasOwnProperty.call(value, subKey)) {
            var subValue = value[subKey];
            if (subValue != null && subValue !== '') {
              elementString += ''.concat(subKey, ':').concat(subValue, '; ');
            }
          }
        }
        value = elementString;
      }
      result += ' '
        .concat(key, '="')
        .concat(replaceHtmlEntities(String(value)), '"');
    }
  };
  for (var key in attributes) {
    _loop_1(key);
  }
  return result;
}

function elementToJson(element) {
  var obj = {};
  for (var i = 0; i < element.attributes.length; i++) {
    obj[element.attributes.item(i).name] = element.attributes.item(i).value;
  }
  element.childNodes.forEach(function (chileNode) {
    var node = chileNode;
    obj = __assign(__assign({}, obj), parseElement(node));
  });
  return obj;
}
function parseElement(node) {
  var obj = {};
  if (node.nodeType === 3) {
    obj['#text'] = node.textContent;
  } else if (node.nodeType === 1) {
    obj[node.nodeName.toLowerCase()] = elementToJson(node);
  }
  return obj;
}

var frameflag = 'documentfragmentcontainer';
function forEachEmbeddedItem(str, callbackfn) {
  var frameflag = 'documentfragmentcontainer';
  var wrappedStr = '<' + frameflag + '>' + str + '</' + frameflag + '>';
  var root = new DOMParser().parseFromString(wrappedStr, 'text/html');

  var embeddedEntries = root.querySelectorAll('.embedded-entry');
  embeddedEntries.forEach(function (element) {
    callbackfn(element.outerHTML, createMetadata(elementToJson(element)));
  });

  var embeddedAssets = root.querySelectorAll('.embedded-asset');
  embeddedAssets.forEach(function (element) {
    callbackfn(element.outerHTML, createMetadata(elementToJson(element)));
  });
}

function renderContent(content, option) {
  // Return blank if content is not present
  if (!content || content === undefined) {
    return '';
  }

  // Render content of type string
  if (typeof content === 'string') {
    var contentToReplace = content;
    forEachEmbeddedItem(content, function (embeddedObjectTag, object) {
      contentToReplace = findAndReplaceEmbeddedItem(
        contentToReplace,
        embeddedObjectTag,
        object,
        option
      );
    });
    return contentToReplace;
  }

  // Render content of type array of strings
  var resultContent = [];
  content.forEach(function (element) {
    resultContent.push(renderContent(element, option));
  });
  return resultContent;
}

// Export the utility function if needed elsewhere

function findRenderContent(keyPaths, entry, render) {
  getContent(keyPaths.split('.'), entry, render);
}
function getContent(keys, object, render) {
  if (keys) {
    var key = keys[0];
    if (keys.length === 1 && object[key]) {
      object[key] = render(object[key]);
    } else if (keys.length > 0) {
      if (object[key]) {
        var newKeys = keys.slice(1);
        if (Array.isArray(object[key])) {
          // tslint:disable-next-line: prefer-for-of
          for (var _i = 0, _a = object[key]; _i < _a.length; _i++) {
            var objKey = _a[_i];
            getContent(newKeys, objKey, render);
          }
        } else if (typeof object[key] === 'object') {
          getContent(newKeys, object[key], render);
        }
      }
    }
  }
}

/**
 *
 * @param {EntryEmbedable| EntryEmbedable[]} entry - Objects that contains RTE with embedded objects
 * @param {string[]} paths - Key paths for RTE contents in Entry object
 * @param {RenderOption?} renderOption -  Optional render options to render content
 */
function render(option) {
  function findContent(path, entry) {
    findRenderContent(path, entry, function (content) {
      return renderContent(content, {
        entry: entry,
        renderOption: option.renderOption,
      });
    });
  }
  function findAndRender(entry) {
    if (!option.paths || option.paths.length === 0) {
      Object.keys(__assign({}, entry._embedded_items)).forEach(function (path) {
        findContent(path, entry);
      });
    } else {
      option.paths.forEach(function (path) {
        findContent(path, entry);
      });
    }
  }
  if (option.entry instanceof Array) {
    option.entry.forEach(function (entry) {
      findAndRender(entry);
    });
  } else {
    findAndRender(option.entry);
  }
}

function findAndReplaceEmbeddedItem(
  content,
  embededObjectTag,
  metadata,
  option
) {
  var embeddedObjects = findEmbeddedItems(metadata, option.entry);
  var renderString = findRenderString(
    embeddedObjects[0],
    metadata,
    option.renderOption
  );
  return content.replace(embededObjectTag, renderString);
}

var Node = /** @class */ (function () {
  function Node() {}
  return Node;
})();

var Document = /** @class */ (function (_super) {
  __extends(Document, _super);
  function Document() {
    var _this = _super.call(this) || this;
    _this.type = NodeType$1.DOCUMENT;
    return _this;
  }
  return Document;
})(Node);

var TextNode = /** @class */ (function (_super) {
  __extends(TextNode, _super);
  function TextNode(text) {
    var _this = _super.call(this) || this;
    _this.text = text;
    return _this;
  }
  return TextNode;
})(Node);

function jsonToHTML$1(option) {
  if (option.entry instanceof Array) {
    enumerate(option.entry, function (entry) {
      jsonToHTML$1({
        entry: entry,
        paths: option.paths,
        renderOption: option.renderOption,
      });
    });
  } else {
    enumerateKeys$1({
      entry: option.entry,
      paths: option.paths,
      renderOption: option.renderOption,
    });
  }
}
function enumerateKeys$1(option) {
  for (var _i = 0, _a = option.paths; _i < _a.length; _i++) {
    var key = _a[_i];
    findRenderContent(key, option.entry, function (content) {
      return enumerateContents(
        content,
        option.renderOption,
        function (metadata) {
          return findEmbeddedItems(metadata, option.entry)[0];
        }
      );
    });
  }
}

function jsonToHTML(option) {
  if (option.entry instanceof Array) {
    enumerate(option.entry, function (entry) {
      jsonToHTML({
        entry: entry,
        paths: option.paths,
        renderOption: option.renderOption,
      });
    });
  } else {
    enumerateKeys({
      entry: option.entry,
      paths: option.paths,
      renderOption: option.renderOption,
    });
  }
}
function enumerateKeys(option) {
  for (var _i = 0, _a = option.paths; _i < _a.length; _i++) {
    var key = _a[_i];
    findRenderContent(key, option.entry, function (content) {
      if (content && content.json) {
        var edges = content.embedded_itemsConnection
          ? content.embedded_itemsConnection.edges
          : [];
        var items_1 = Object.values(edges || []).reduce(function (
          accumulator,
          value
        ) {
          return accumulator.concat(value.node);
        },
        []);
        return enumerateContents(
          content.json,
          option.renderOption,
          function (metadata) {
            return findGQLEmbeddedItems(metadata, items_1)[0];
          }
        );
      }
      return content;
    });
  }
}
var GQL = {
  jsonToHTML: jsonToHTML,
};

function addTags(entry, contentTypeUid, tagsAsObject, locale) {
  var _a;
  if (locale === void 0) {
    locale = 'en-us';
  }
  if (entry) {
    var appliedVariants =
      entry._applied_variants ||
      ((_a = entry === null || entry === void 0 ? void 0 : entry.system) ===
        null || _a === void 0
        ? void 0
        : _a.applied_variants) ||
      null;
    entry.$ = getTag(
      entry,
      ''.concat(contentTypeUid, '.').concat(entry.uid, '.').concat(locale),
      tagsAsObject,
      locale,
      {
        _applied_variants: appliedVariants,
        shouldApplyVariant: !!appliedVariants,
        metaKey: '',
      }
    );
  }
}
function getTag(content, prefix, tagsAsObject, locale, appliedVariants) {
  var tags = {};
  appliedVariants.metaKey;
  var shouldApplyVariant = appliedVariants.shouldApplyVariant,
    _applied_variants = appliedVariants._applied_variants;
    objectEntries(content).forEach(function (_a) {
      var key = _a[0],
        value = _a[1];
      if (key === "$") return;
      var metaUID =
        value &&
        typeof value === "object" &&
        value._metadata &&
        value._metadata.uid
          ? value._metadata.uid
          : "";
      var updatedMetakey = appliedVariants.shouldApplyVariant
        ? ""
            .concat(
              appliedVariants.metaKey ? appliedVariants.metaKey + "." : ""
            )
            .concat(key)
        : "";
      if (metaUID && updatedMetakey)
        updatedMetakey = updatedMetakey + "." + metaUID;
      switch (typeof value) {
        case "object":
          if (Array.isArray(value)) {
            value.forEach(function (obj, index) {
              var _a;
              var childKey = "".concat(key, "__").concat(index);
              var parentKey = "".concat(key, "__parent");
              metaUID =
                value &&
                typeof value === "object" &&
                obj._metadata &&
                obj._metadata.uid
                  ? obj._metadata.uid
                  : "";
              updatedMetakey = appliedVariants.shouldApplyVariant
                ? ""
                    .concat(
                      appliedVariants.metaKey
                        ? appliedVariants.metaKey + "."
                        : ""
                    )
                    .concat(key)
                : "";
              if (metaUID && updatedMetakey)
                updatedMetakey = updatedMetakey + "." + metaUID;
              /**
               * Indexes of array are handled here
               * {
               *  "array": ["hello", "world"],
               *  "$": {
               *      "array": {"data-cslp": "content_type_uid.entry_uid.locale.array"}
               *      "array__0": {"data-cslp": "content_type_uid.entry_uid.locale.array.0"}
               *      "array__1": {"data-cslp": "content_type_uid.entry_uid.locale.array.1"}
               *  }
               * }
               */
              tags[childKey] = getTagsValue(
                "".concat(prefix, ".").concat(key, ".").concat(index),
                tagsAsObject,
                {
                  _applied_variants: _applied_variants,
                  shouldApplyVariant: shouldApplyVariant,
                  metaKey: updatedMetakey,
                }
              );
              tags[parentKey] = getParentTagsValue(
                "".concat(prefix, ".").concat(key),
                tagsAsObject
              );
              if (
                typeof obj !== "undefined" &&
                obj !== null &&
                obj._content_type_uid !== undefined &&
                obj.uid !== undefined
              ) {
                /**
                 * References are handled here
                 * {
                 *  "reference": [{
                 *      "title": "title",
                 *      "uid": "ref_uid",
                 *      "_content_type_uid": "ref_content_type_uid",
                 *     "$": {"title": {"data-cslp": "ref_content_type_uid.ref_uid.locale.title"}}
                 *  }]
                 * }
                 */
                var newAppliedVariants =
                  obj._applied_variants ||
                  ((_a =
                    obj === null || obj === void 0 ? void 0 : obj.system) ===
                    null || _a === void 0
                    ? void 0
                    : _a.applied_variants) ||
                  _applied_variants;
                var newShouldApplyVariant = !!newAppliedVariants;
                value[index].$ = getTag(
                  obj,
                  ""
                    .concat(obj._content_type_uid, ".")
                    .concat(obj.uid, ".")
                    .concat(obj.locale || locale),
                  tagsAsObject,
                  locale,
                  {
                    _applied_variants: newAppliedVariants,
                    shouldApplyVariant: newShouldApplyVariant,
                    metaKey: "",
                  }
                );
              } else if (typeof obj === "object") {
                /**
                 * Objects inside Array like modular blocks are handled here
                 * {
                 *  "array": [{
                 *    "title": "title",
                 *    "$": {"title": {"data-cslp": "content_type_uid.entry_uid.locale.array.0.title"}}
                 *  }]
                 * }
                 */
                obj.$ = getTag(
                  obj,
                  "".concat(prefix, ".").concat(key, ".").concat(index),
                  tagsAsObject,
                  locale,
                  {
                    _applied_variants: _applied_variants,
                    shouldApplyVariant: shouldApplyVariant,
                    metaKey: updatedMetakey,
                  }
                );
              }
            });
          } else {
            if (value) {
              /**
               * Objects are handled here
               * {
               *  "object": {
               *      "title": "title",
               *      "$": {
               *          "title": {"data-cslp": "content_type_uid.entry_uid.locale.object.title"}
               *      }
               *  },
               * }
               */
              value.$ = getTag(
                value,
                "".concat(prefix, ".").concat(key),
                tagsAsObject,
                locale,
                {
                  _applied_variants: _applied_variants,
                  shouldApplyVariant: shouldApplyVariant,
                  metaKey: updatedMetakey,
                }
              );
            }
          }
          /**
           * {
           *  "object": {
           *      "title": "title",
           *  },
           *  "array": ["hello", "world"]
           *  "$": {
           *      "object": {"data-cslp": "content_type_uid.entry_uid.locale.object"},
           *      "array": {"data-cslp": "content_type_uid.entry_uid.locale.array"}
           *  }
           * }
           */
          tags[key] = getTagsValue(
            "".concat(prefix, ".").concat(key),
            tagsAsObject,
            {
              _applied_variants: _applied_variants,
              shouldApplyVariant: shouldApplyVariant,
              metaKey: updatedMetakey,
            }
          );
          break;
        default:
          /**
           * All primitive values are handled here
           * {
           *  "title": "title",
           *  "$": {title: {"data-cslp": "content_type_uid.entry_uid.locale.title"}}
           * }
           */
          tags[key] = getTagsValue(
            "".concat(prefix, ".").concat(key),
            tagsAsObject,
            {
              _applied_variants: _applied_variants,
              shouldApplyVariant: shouldApplyVariant,
              metaKey: updatedMetakey,
            }
          );
      }
    });
  return tags;
}
function getTagsValue(dataValue, tagsAsObject, appliedVariants) {
  if (
    appliedVariants.shouldApplyVariant &&
    appliedVariants._applied_variants &&
    appliedVariants._applied_variants[appliedVariants.metaKey]
  ) {
    var variant = appliedVariants._applied_variants[appliedVariants.metaKey];
    // Adding v2 prefix to the cslp tag. New cslp tags are in v2 format. ex: v2:content_type_uid.entry_uid.locale.title
    var newDataValueArray = ('v2:' + dataValue).split('.');
    newDataValueArray[1] = newDataValueArray[1] + '_' + variant;
    dataValue = newDataValueArray.join('.');
  }
  if (tagsAsObject) {
    return { 'data-cslp': dataValue };
  } else {
    return 'data-cslp='.concat(dataValue);
  }
}
function getParentTagsValue(dataValue, tagsAsObject) {
  if (tagsAsObject) {
    return { 'data-cslp-parent-field': dataValue };
  } else {
    return 'data-cslp-parent-field='.concat(dataValue);
  }
}

function updateAssetURLForGQL(gqlResponse) {
  try {
    var response =
      gqlResponse === null || gqlResponse === void 0
        ? void 0
        : gqlResponse.data;
    for (var contentType in response) {
      if ('items' in response[contentType]) {
        var entries = response[contentType].items;
        entries.forEach(function (entry) {
          processEntry(entry);
        });
      } else {
        processEntry(response[contentType]);
      }
    }
  } catch (error) {
    console.error('Error in updating asset URL for GQL response', error);
  }
}
function processEntry(entry) {
  for (var field in entry) {
    var fieldData = entry[field];
    if (fieldData instanceof Array) {
      fieldData.forEach(function (data) {
        findRTEFieldAndUpdateURL(data);
      });
    } else if (fieldData && typeof fieldData === 'object') {
      findRTEFieldAndUpdateURL(fieldData);
    }
  }
}
function findRTEFieldAndUpdateURL(fieldData) {
  var _a;
  var rteField = findRTEField(fieldData);
  if (!rteField) return;
  var edges =
    (_a =
      rteField === null || rteField === void 0
        ? void 0
        : rteField.embedded_itemsConnection) === null || _a === void 0
      ? void 0
      : _a.edges;
  edges.forEach(function (edge) {
    var _a, _b, _c;
    var node = edge.node;
    if (
      (node === null || node === void 0 ? void 0 : node.url) &&
      (node === null || node === void 0 ? void 0 : node.filename)
    ) {
      if (
        !((_a = node === null || node === void 0 ? void 0 : node.system) ===
          null || _a === void 0
          ? void 0
          : _a.uid)
      )
        throw new Error('Asset UID not found in the response');
      var correspondingAsset =
        (_c =
          (_b =
            rteField === null || rteField === void 0
              ? void 0
              : rteField.json) === null || _b === void 0
            ? void 0
            : _b.children) === null || _c === void 0
          ? void 0
          : _c.find(function (child) {
              return child.attrs['asset-uid'] === node.system.uid;
            });
      correspondingAsset.attrs['asset-link'] = node.url;
    }
  });
}
function findRTEField(fieldData) {
  if (fieldData && fieldData.embedded_itemsConnection) {
    return fieldData;
  }
  for (var key in fieldData) {
    if (fieldData[key] && typeof fieldData[key] === 'object') {
      var found = findRTEField(fieldData[key]);
      if (found) {
        return found;
      }
    }
  }
}

module.exports = {
  Document: Document,
  GQL: GQL,
  MarkType: MarkType$1,
  Node: Node,
  NodeType: NodeType$1,
  StyleType: StyleType$1,
  TextNode: TextNode,
  addEditableTags: addTags,
  attributeToString: attributeToString,
  jsonToHTML: jsonToHTML$1,
  render: render,
  renderContent: renderContent,
  updateAssetURLForGQL: updateAssetURLForGQL,
};
