// Matrix Text Scrambler & Hover Decipher Engine for Connect

export class MatrixScrambler {
  constructor(element, targetText = "Enter Connect's World") {
    this.element = element;
    this.targetText = targetText;
    this.chars = "0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?/~$";
    this.frame = 0;
    this.queue = [];
    this.isHovered = false;
    this.animationFrameId = null;

    this.initQueue();
    this.setupListeners();
    this.startScrambling();
  }

  initQueue() {
    this.queue = [];
    for (let i = 0; i < this.targetText.length; i++) {
      const char = this.targetText[i];
      this.queue.push({
        char,
        from: this.randomChar(),
        to: char,
        start: Math.floor(Math.random() * 15),
        end: Math.floor(Math.random() * 15) + 20
      });
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  setupListeners() {
    if (!this.element) return;

    this.element.addEventListener("mouseenter", () => {
      this.isHovered = true;
      this.frame = 0;
      this.initQueue();
    });

    this.element.addEventListener("mouseleave", () => {
      this.isHovered = false;
    });
  }

  startScrambling() {
    const update = () => {
      let output = "";
      let complete = 0;

      if (this.isHovered) {
        for (let i = 0; i < this.queue.length; i++) {
          let { char, from, to, start, end } = this.queue[i];
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            output += `<span class="scramble-glow">${this.randomChar()}</span>`;
          } else {
            output += from;
          }
        }
        this.frame++;
      } else {
        // Continuous encrypted scrambling state
        for (let i = 0; i < this.targetText.length; i++) {
          if (this.targetText[i] === " ") {
            output += " ";
          } else {
            output += `<span class="scramble-encrypted">${this.randomChar()}</span>`;
          }
        }
      }

      if (this.element) {
        this.element.innerHTML = output;
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
