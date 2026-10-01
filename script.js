document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const pageTopBtn = document.getElementById('pageTopBtn');
  const loadingScreen = document.querySelector('.loading-screen');

  // ===================================================
  // メニューリンクの文字を自動でキューブ用属性(data-text)に反映
  // ===================================================
  document.querySelectorAll('.header-nav a, .nav-overlay a').forEach(a => {
    a.setAttribute('data-text', a.textContent.trim());
  });

  // ===================================================
  // ブラウザバック/リロード時のチラつき防止
  // ===================================================
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && loadingScreen) {
      loadingScreen.classList.remove('is-closing');
    }
  });

  // ===================================================
  // ページ遷移リンク押下時：先に現在のページで幕を閉じる
  // ===================================================
  const pageLinks = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');

  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      if (!targetUrl || targetUrl === currentPage) return;

      e.preventDefault();

      if (loadingScreen) {
        loadingScreen.classList.add('is-closing');

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 300);
      } else {
        window.location.href = targetUrl;
      }
    });
  });

  // ===================================================
  // 1. テキストを1文字ずつ上から降らせる処理
  //    ★ .detail-tag を除外し、タグ全体のフェードインに変更
  // ===================================================
  const textTargetSelectors = [
    '.top-hero h1',
    '.section-title',
    '.profile-name',
    '.profile-desc p',
    '.profile-links p',
    '.detail-info p',
    '.detail-info .meta',
    '.detail-info .desc',
    '.detail-info .note',
    '.back-link'
  ];

  const textContainers = document.querySelectorAll(textTargetSelectors.join(', '));
  let charGlobalDelay = 1.40;
  const charStep = 0.015;

  const punctuationRegex = /[、。，．！？!?）)]/;

  function splitTextToChars(element) {
    const nodes = Array.from(element.childNodes);

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim() && text.includes('\n')) return;

        const fragment = document.createDocumentFragment();
        const chars = Array.from(text);

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          const nextChar = chars[i + 1];

          if (char === ' ' || char === '\n' || char === '\t' || char === ' ') {
            fragment.appendChild(document.createTextNode(char));
            continue;
          }

          if (nextChar && punctuationRegex.test(nextChar)) {
            const pairSpan = document.createElement('span');
            pairSpan.className = 'no-break-pair';

            const span1 = document.createElement('span');
            span1.className = 'char-anim';
            span1.textContent = char;
            span1.style.animationDelay = `${charGlobalDelay.toFixed(3)}s`;
            charGlobalDelay += charStep;
            pairSpan.appendChild(span1);

            const span2 = document.createElement('span');
            span2.className = 'char-anim';
            span2.textContent = nextChar;
            span2.style.animationDelay = `${charGlobalDelay.toFixed(3)}s`;
            charGlobalDelay += charStep;
            pairSpan.appendChild(span2);

            fragment.appendChild(pairSpan);
            i++;
          } else {
            const span = document.createElement('span');
            span.className = 'char-anim';
            span.textContent = char;
            span.style.animationDelay = `${charGlobalDelay.toFixed(3)}s`;
            fragment.appendChild(span);
            charGlobalDelay += charStep;
          }
        }

        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() !== 'br') {
          splitTextToChars(node);
        }
      }
    });
  }

  textContainers.forEach(container => {
    splitTextToChars(container);
  });

  // ===================================================
  // 2. ハンバーガーメニュー開閉
  // ===================================================
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      navMenu.classList.toggle('open');
    });
  }

  // ===================================================
  // 3. Page Top ボタン：表示監視 ＆ 確実なスムーズスクロール
  // ===================================================
  if (pageTopBtn) {
    const getScrollTop = () => {
      return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    const handleScroll = () => {
      if (getScrollTop() > 150) {
        pageTopBtn.classList.add('is-visible');
      } else {
        pageTopBtn.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const smoothScrollToTop = (duration = 450) => {
      const startPos = getScrollTop();
      if (startPos === 0) return;

      const startTime = performance.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeOutCubic(progress);

        const currentPos = startPos * (1 - ease);
        window.scrollTo(0, currentPos);
        document.documentElement.scrollTop = currentPos;
        document.body.scrollTop = currentPos;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    pageTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      smoothScrollToTop(450);
    });
  }
});