export default class ControllableInterval {
    private timer: NodeJS.Timeout | undefined;

    constructor(
        private readonly callback: () => void | Promise<void>,
        private readonly delay: number,
    ) {
        this.start();
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                void this.callback();
            }, this.delay);
        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
}
