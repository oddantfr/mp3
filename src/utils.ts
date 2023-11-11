export function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
	// toastit('Copied to clipboard.')
}

/**
 * Re-dispatches an event from the provided element.
 *
 * This function is useful for forwarding non-composed events, such as `change`
 * events.
 *
 * @example
 * class MyInput extends LitElement {
 *   render() {
 *     return html`<input @change=${this.redispatchEvent}>`;
 *   }
 *
 *   protected redispatchEvent(event: Event) {
 *     redispatchEvent(this, event);
 *   }
 * }
 *
 * @param element The element to dispatch the event from.
 * @param event The event to re-dispatch.
 * @return Whether or not the event was dispatched (if cancelable).
 */
export function redispatchEvent(element: Element, event: Event) {
	// For bubbling events in SSR light DOM (or composed), stop their propagation
	// and dispatch the copy.
	if (event.bubbles && (!element.shadowRoot || event.composed)) {
		event.stopPropagation();
	}

	const copy = Reflect.construct(event.constructor, [event.type, event]);
	const dispatched = element.dispatchEvent(copy);
	if (!dispatched) {
		event.preventDefault();
	}

	return dispatched;
}

export function ms(timeString: string) {
	const regex = /^(\d+)([smh])$/;
	const match = timeString.match(regex);

	if (!match) {
		// Invalid format
		throw new Error('Invalid time string');
	}

	const value = parseInt(match[1]);
	const unit = match[2];

	switch (unit) {
		case 's':
			return value * 1000;
		case 'm':
			return value * 60 * 1000;
		case 'h':
			return value * 60 * 60 * 1000;
		default:
			throw new Error('Invalid time unit');
	}
}
