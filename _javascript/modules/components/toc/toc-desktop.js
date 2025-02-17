export class TocDesktop {
  /* Tocbot options Ref: https://github.com/tscanlin/tocbot#usage */
  static options = {
    tocSelector: '#toc',
    contentSelector: '.content',
    ignoreSelector: '[data-toc-skip]',
    headingSelector: 'h2, h3, h4',
    orderedList: false,
    scrollSmooth: false,
    headingsOffset: 16 * 2 // 2rem
  };

  static refresh() {
    tocbot.refresh(this.options);

    const $tocWrapper = document.getElementById('toc-wrapper');
    const $googleAds = document.getElementById('toc-wrapper-ad');

    const tocWrapperHeight = $tocWrapper.offsetHeight;
    $googleAds.style.top = (tocWrapperHeight + 40) + 'px'; // 20px는 간격 조절

  }

  static init() {
    tocbot.init(this.options);
  }
}
