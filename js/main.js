// main.js
import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

// 取按钮并绑定
document.getElementById('btn1').addEventListener('click', drawFig1);
document.getElementById('btn2').addEventListener('click', drawFig2);
document.getElementById('btn3').addEventListener('click', drawFig3);
document.getElementById('btn4').addEventListener('click', drawFig4);

// 页面一加载就默认显示 Fig1
document.addEventListener('DOMContentLoaded', () => {
  drawFig1();
});
