document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.inbody-form');
  const submitBtn = document.getElementById('submit-btn');
  const inputs = form.querySelectorAll('.styled-input');
  const STORAGE_PREFIX = "mbSave:";
  const DEFAULT_USER = "guest";

  function getCurrentUser() {
    return localStorage.getItem("mbCurrentUser") || localStorage.getItem("qrLoginUser") || DEFAULT_USER;
  }

  function getUserSaveKey() {
    return STORAGE_PREFIX + getCurrentUser();
  }

  function upsertBodyType(bodyType) {
    const saveKey = getUserSaveKey();
    try {
      const raw = localStorage.getItem(saveKey);
      const parsed = raw ? JSON.parse(raw) : {};
      const totalXp = Math.max(0, Math.floor(Number(parsed && parsed.totalXp) || 0));
      localStorage.setItem(saveKey, JSON.stringify({
        totalXp: totalXp,
        bodyType: bodyType
      }));
    } catch (e) {
      localStorage.setItem(saveKey, JSON.stringify({
        totalXp: 0,
        bodyType: bodyType
      }));
    }
  }

  // 檢查是否所有欄位都有輸入值，有則啟用按鈕
  function checkFormFilled() {
    const allFilled = Array.from(inputs).every(function(input) {
      return input.value.trim() !== '';
    });
    submitBtn.disabled = !allFilled;
  }

  inputs.forEach(function(input) {
    input.addEventListener('input', checkFormFilled);
    input.addEventListener('change', checkFormFilled);
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止表單跳轉

    // 取得使用者輸入的數值
    const weight = parseFloat(document.getElementById('weight').value);
    const muscle = parseFloat(document.getElementById('muscle').value);
    const fat = parseFloat(document.getElementById('fat').value);

    // 邏輯判斷 (InBody 標準 CID 定義簡化版)
    let targetPage = "";

    let bodyType = "I";

    // C 型：肌肉量比例低於脂肪與體重的連線
    if (muscle < weight * 0.45 && muscle < fat) {
      targetPage = "cType.html";
      bodyType = "C";
    } 
    // D 型：肌肉量比例高於脂肪與體重
    else if (muscle > weight * 0.5 && muscle > fat) {
      targetPage = "dType.html";
      bodyType = "D";
    } 
    // I 型：三者比例接近
    else {
      targetPage = "iType.html";
      bodyType = "I";
    }

    upsertBodyType(bodyType);

    // 執行跳轉
    console.log("偵測到體型，正在前往：" + targetPage);
    window.location.href = targetPage;
  });
});