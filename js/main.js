/* ============================================================
   Pâtisserie Chocolaterie ARTK - Main JS
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Header scroll ── */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Hamburger / Drawer ── */
  const hamburger     = document.getElementById('hamburger');
  const drawer        = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose   = document.getElementById('drawerClose');

  const openDrawer = () => {
    drawer.classList.add('open');
    drawerOverlay.classList.add('active');
    hamburger.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  drawerOverlay.addEventListener('click', closeDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ── Hero Swiper ── */
  if (typeof Swiper !== 'undefined') {
    new Swiper('.hero-swiper', {
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1000,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next',
      },
    });

    let gallerySwiper = null;
    const mobileGalleryMedia = window.matchMedia('(max-width: 767px)');

    const setupGallerySwiper = () => {
      if (!mobileGalleryMedia.matches) {
        if (gallerySwiper) {
          gallerySwiper.destroy(true, true);
          gallerySwiper = null;
        }
        return;
      }

      if (gallerySwiper) return;

      gallerySwiper = new Swiper('.gallery-mobile', {
        loop: false,
        slidesPerView: 1,
        spaceBetween: 12,
        speed: 700,
        allowTouchMove: true,
        simulateTouch: true,
        grabCursor: true,
        touchRatio: 1,
        touchStartPreventDefault: false,
        observer: true,
        observeParents: true,
        pagination: {
          el: '.gallery-mobile-count',
          type: 'custom',
          renderCustom(_swiper, current, total) {
            return `&lt;${current}/${total}&gt;`;
          },
        },
      });
    };

    setupGallerySwiper();
    mobileGalleryMedia.addEventListener('change', setupGallerySwiper);
  }

  /* ── AOS ── */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 80,
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Contact form bridge ── */
  const contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    const nameField = document.getElementById('contact-name');
    const emailField = document.getElementById('contact-email');
    const telField = document.getElementById('contact-tel');
    const confirmButton = contactForm.querySelector('.js-contact-confirm');
    const backButton = contactForm.querySelector('.js-contact-back');
    const inputStep = contactForm.querySelector('[data-step="input"]');
    const confirmStep = contactForm.querySelector('[data-step="confirm"]');
    const confirmTargets = {
      name: contactForm.querySelector('[data-confirm="name"]'),
      email: contactForm.querySelector('[data-confirm="email"]'),
      tel: contactForm.querySelector('[data-confirm="tel"]'),
      subject: contactForm.querySelector('[data-confirm="subject"]'),
      message: contactForm.querySelector('[data-confirm="message"]'),
    };
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const consentField = contactForm.querySelector('input[name="privacyAgree"]');
    const statusField = contactForm.querySelector('.contact-form-status');
    const messageField = document.getElementById('contact-message');
    const subjectField = document.getElementById('contact-subject');
    const honeypotField = contactForm.querySelector('input[name="bot-field"]');

    const showStep = stepName => {
      const isConfirm = stepName === 'confirm';
      if (inputStep && confirmStep) {
        inputStep.classList.toggle('is-active', !isConfirm);
        inputStep.setAttribute('aria-hidden', String(isConfirm));
        confirmStep.classList.toggle('is-active', isConfirm);
        confirmStep.setAttribute('aria-hidden', String(!isConfirm));
      }
    };

    const fillConfirmation = () => {
      if (confirmTargets.name) confirmTargets.name.textContent = nameField?.value.trim() || '未入力';
      if (confirmTargets.email) confirmTargets.email.textContent = emailField?.value.trim() || '未入力';
      if (confirmTargets.tel) confirmTargets.tel.textContent = telField?.value.trim() || '未入力';
      if (confirmTargets.subject) confirmTargets.subject.textContent = subjectField?.value || '未入力';
      if (confirmTargets.message) confirmTargets.message.textContent = messageField?.value.trim() || '未入力';
    };

    confirmButton?.addEventListener('click', () => {
      if (!contactForm.reportValidity()) return;

      if (statusField) {
        statusField.classList.remove('is-error', 'is-success');
        statusField.textContent = '';
      }

      fillConfirmation();
      showStep('confirm');
      contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    backButton?.addEventListener('click', () => {
      showStep('input');
      contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!confirmStep?.classList.contains('is-active')) return;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
      }

      if (statusField) {
        statusField.classList.remove('is-error', 'is-success');
        statusField.textContent = '';
      }

      try {
        const response = await fetch(contactForm.getAttribute('action') || '/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nameField?.value.trim() || '',
            email: emailField?.value.trim() || '',
            tel: telField?.value.trim() || '',
            subject: subjectField?.value || '',
            message: messageField?.value.trim() || '',
            privacyAgree: !!consentField?.checked,
            botField: honeypotField?.value.trim() || '',
          }),
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        contactForm.reset();
        showStep('input');

        if (statusField) {
          statusField.classList.add('is-success');
          statusField.textContent = 'お問い合わせを送信しました。確認のうえ折り返しご連絡いたします。';
        }
      } catch (_error) {
        if (statusField) {
          statusField.classList.add('is-error');
          statusField.textContent = '送信に失敗しました。時間をおいて再度お試しいただくか、お電話でご連絡ください。';
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'この内容で送信する';
        }
      }
    });
  }

});
