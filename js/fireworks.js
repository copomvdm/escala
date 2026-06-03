(function registerFireworks(window) {
  "use strict";

  const namespace = (window.COPOMScale = window.COPOMScale || {});
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  class Particle {
    constructor(context, x, y, color) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.color = color;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 4 + 1;
      this.friction = 0.965;
      this.gravity = 0.85;
      this.alpha = 1;
      this.decay = Math.random() * 0.025 + 0.012;
    }

    update() {
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;
    }

    draw() {
      this.context.save();
      this.context.globalAlpha = Math.max(this.alpha, 0);
      this.context.beginPath();
      this.context.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
      this.context.fillStyle = this.color;
      this.context.fill();
      this.context.restore();
    }

    isExpired() {
      return this.alpha <= 0;
    }
  }

  class Firework {
    constructor(context) {
      this.context = context;
      this.x = Math.random() * window.innerWidth;
      this.y = window.innerHeight;
      this.targetX = Math.random() * window.innerWidth;
      this.targetY = Math.random() * (window.innerHeight * 0.45);
      this.speed = 4;
      this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
      this.color = `hsl(${Math.random() * 360}, 85%, 62%)`;
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
      this.context.beginPath();
      this.context.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
      this.context.fillStyle = this.color;
      this.context.fill();
    }

    hasReachedTarget() {
      return this.y <= this.targetY;
    }
  }

  function createNoopController() {
    return Object.freeze({
      launch() {},
      stop() {},
    });
  }

  function createFireworksController(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return createNoopController();
    }

    const context = canvas.getContext("2d", {
      alpha: true,
    });

    if (!context) {
      return createNoopController();
    }

    const fireworks = [];
    const particles = [];

    let animationFrameId = null;
    let launchIntervalId = null;
    let resizeHandler = null;
    let isRunning = false;

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function clearCanvas() {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }

    function createExplosion(firework) {
      const particleCount = 85;

      for (let index = 0; index < particleCount; index += 1) {
        particles.push(
          new Particle(context, firework.x, firework.y, firework.color)
        );
      }
    }

    function drawFrameBackground() {
      context.fillStyle = "rgba(8, 13, 24, 0.16)";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function updateFireworks() {
      for (let index = fireworks.length - 1; index >= 0; index -= 1) {
        const firework = fireworks[index];

        firework.update();
        firework.draw();

        if (firework.hasReachedTarget()) {
          createExplosion(firework);
          fireworks.splice(index, 1);
        }
      }
    }

    function updateParticles() {
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];

        if (particle.isExpired()) {
          particles.splice(index, 1);
          continue;
        }

        particle.update();
        particle.draw();
      }
    }

    function animate() {
      if (!isRunning) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(animate);

      drawFrameBackground();
      updateFireworks();
      updateParticles();
    }

    function addFirework() {
      if (!isRunning || prefersReducedMotion.matches) {
        return;
      }

      if (fireworks.length < 8) {
        fireworks.push(new Firework(context));
      }
    }

    function launch() {
      if (prefersReducedMotion.matches || isRunning) {
        return;
      }

      isRunning = true;

      resizeCanvas();
      clearCanvas();

      canvas.classList.add("is-visible");

      fireworks.splice(0, fireworks.length);
      particles.splice(0, particles.length);

      fireworks.push(new Firework(context));

      animate();

      launchIntervalId = window.setInterval(addFirework, 700);

      resizeHandler = () => {
        resizeCanvas();
      };

      window.addEventListener("resize", resizeHandler, {
        passive: true,
      });
    }

    function stop() {
      isRunning = false;

      if (launchIntervalId !== null) {
        window.clearInterval(launchIntervalId);
        launchIntervalId = null;
      }

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      if (resizeHandler !== null) {
        window.removeEventListener("resize", resizeHandler);
        resizeHandler = null;
      }

      fireworks.splice(0, fireworks.length);
      particles.splice(0, particles.length);

      clearCanvas();
      canvas.classList.remove("is-visible");
    }

    prefersReducedMotion.addEventListener("change", () => {
      if (prefersReducedMotion.matches) {
        stop();
      }
    });

    return Object.freeze({
      launch,
      stop,
    });
  }

  namespace.createFireworksController = createFireworksController;
})(window);
