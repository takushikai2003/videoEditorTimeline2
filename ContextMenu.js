"use strict";

// let contextMenu;

export class ContextMenu {
    /**
     * @typedef {Object} MenuItem
     * @property {string} label - The display name of the menu item.
     * @property {Function} action - The function to execute when the menu item is clicked.
     */

    /**
     * @param {MenuItem[]} items
     * @param {number} x -絶対座標
     * @param {number} y -絶対座標
     */
    constructor(items, x, y) {
        // const menu = document.createElement('div');
        // menu.classList.add('context-menu');
        // // menu.tabIndex = -1; // フォーカス可能にする

        // for(const item of items){
        //     const div = document.createElement("div");
        //     div.textContent = item.label;

        //     div.addEventListener("click",()=>{
        //         item.action();
        //     });

        //     menu.appendChild(div);
        // }

        // menu.style.top = y + "px";
        // menu.style.left = x + "px";
        
        // document.body.appendChild(menu);
        // menu.focus();

        // menu.addEventListener("blur",()=>{
        //     menu.remove();
        // });


        // e.preventDefault();

        // メニュー生成
        const contextMenu = document.createElement("menu");
        contextMenu.className = "context-menu surface right no-wrap active";
        contextMenu.style.top = 0//x + "px";
        contextMenu.style.left = 0//y + "px";
        contextMenu.tabIndex = -1;  // フォーカス可能にする

        contextMenu.innerHTML = `
            <li onclick="alert('削除')">削除</li>
            <li onclick="alert('分割')">分割</li>
        `;

        document.body.appendChild(contextMenu);

        // フォーカスが外れたら自動削除
        contextMenu.focus();
        contextMenu.addEventListener("blur", () => {
            // contextMenu.remove();
            // contextMenu = null;
        });
    }
}