"use strict";

export class ContextMenu {
    /**
     * @typedef {Object} MenuItem
     * @property {string} label - The display name of the menu item.
     * @property {Function} action - The function to execute when the menu item is clicked.
     */

    /**
     * @param {MenuItem[]} items
     * @param {number} x
     * @param {number} y
     */
    constructor(items, x, y) {
        const menu = document.createElement('div');
        menu.classList.add('context-menu');
        menu.tabIndex = -1; // フォーカス可能にする

        for(const item of items){
            const div = document.createElement("div");
            div.textContent = item.label;

            div.addEventListener("click",()=>{
                item.action();
            });

            menu.appendChild(div);
        }

        menu.style.top = y + "px";
        menu.style.left = x + "px";
        
        document.body.appendChild(menu);
        menu.focus();

        menu.addEventListener("blur",()=>{
            menu.remove();
        });
    }
}