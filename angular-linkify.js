angular.module('linkify', []);

angular.module('linkify')
.filter('linkify', function () {
  'use strict';

  var regexes = {
    url: /(?:https?\:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:\/~+#-]*[\w@?!^=%&amp;\/~+#-])?/ig,
    email: /[\w-.!#$%&'*+=/=?^_`{|}~]+[+]?[\w-.!#$%&'*+=/=?^_`{|}~]+@[\w-.!#$%&'*+=/=?^_`{|}~]+\.[a-zA-Z]{2,6}/ig,
    github: /(([\w]+:)?\/\/)/ig,
    protocol: /(([\w]+:)?\/\/)/ig,
    twitterUser: /\B\@([\w\-]+)/ig,
    twitterHashtag: /#([\u00C0-\u1FFF\w]+)/ig
  };

  function generate_link (type) {
    return function (url) {
      var wrap = document.createElement('div');
      var anch = document.createElement('a');
      var text = url;

      switch (type) {
        case 'email':
          url = url.replace(/^/, 'mailto:');
          break;
        case 'github':
          url = url.replace(/^/, 'https://github.com/');
          break;
        case 'twitterUser':
          url = url.replace(/^/, 'https://twitter.com/');
          break;
        case 'twitterHashtag':
          url = url.replace(/^/, 'https://twitter.com/search?q=%23');
          break;
        case 'url':
          if (!regexes.protocol.test(url)) {
            url = url.replace(/^/, 'http://');
          }
          break;
        default:
          break;
      }

      anch.target = '_blank';
      anch.href = url;
      anch.innerHTML = text;
      wrap.appendChild(anch);
      return wrap.innerHTML;
    };
  }

  return function (_str, type) {
    var _text = _str;

    if (!_str) {
      return;
    }

    _text = _str.replace(regexes.url, generate_link('url'));
    _text = _text.replace(regexes.email, generate_link('email'));

    if (type === 'twitter'){
      _text = _text.replace(regexes.twitterUser, generate_link('twitterUser'));
      _text = _text.replace(regexes.twitterHashtag, generate_link('twitterHashtag'));
    }

    if (type === 'github') {
      _text = _text.replace(regexes.github, generate_link('github'));
    }

    return _text;
  };
})
.factory('linkify', ['$filter', function ($filter) {
  'use strict';

  function _linkifyAsType (type) {
    return function (str) {
      return $filter('linkify')(str, type);
    };
  }

  return {
    twitter: _linkifyAsType('twitter'),
    github: _linkifyAsType('github'),
    normal: _linkifyAsType()
  };
}])
.directive('linkify', ['$filter', '$timeout', 'linkify', function ($filter, $timeout, linkify) {
  'use strict';

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var type = attrs.linkify || 'normal';
      $timeout(function () {
        element.html(linkify[type](element.html()));
      });
    }
  };
}]);
