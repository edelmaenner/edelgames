import React from "react";

export function onEnterKeyEvent(callback: {(): void}, event: React.KeyboardEvent<HTMLInputElement>): void {
    if(event.key === 'Enter') {
        callback();
    }
}