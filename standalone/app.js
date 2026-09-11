// ReCircuit Standalone Interactive Application Logic
let currentOtp = '7842';
let walletBalance = 0;

function showToast(msg) {
  const toast = document.getElementById('toastBox');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.innerText = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3500);
  }
}

function setMode(mode) {
  const modeDual = document.getElementById('modeDual');
  const modeCollector = document.getElementById('modeCollector');
  const modeSeller = document.getElementById('modeSeller');

  if (modeDual) modeDual.classList.remove('active');
  if (modeCollector) modeCollector.classList.remove('active');
  if (modeSeller) modeSeller.classList.remove('active');

  const colCard = document.getElementById('collectorCard');
  const selCard = document.getElementById('sellerCard');
  const grid = document.getElementById('mainGrid');

  if (mode === 'dual') {
    if (modeDual) modeDual.classList.add('active');
    if (colCard) colCard.style.display = 'block';
    if (selCard) selCard.style.display = 'block';
    if (grid) grid.style.gridTemplateColumns = window.innerWidth > 920 ? '1fr 1fr' : '1fr';
  } else if (mode === 'collector') {
    if (modeCollector) modeCollector.classList.add('active');
    if (colCard) colCard.style.display = 'block';
    if (selCard) selCard.style.display = 'none';
    if (grid) grid.style.gridTemplateColumns = '1fr';
  } else if (mode === 'seller') {
    if (modeSeller) modeSeller.classList.add('active');
    if (colCard) colCard.style.display = 'none';
    if (selCard) selCard.style.display = 'block';
    if (grid) grid.style.gridTemplateColumns = '1fr';
  }
}

function collectorArrive() {
  // Advance Collector Step
  const cStep2 = document.getElementById('cStep2');
  const cStep3 = document.getElementById('cStep3');
  const collectorStatusTag = document.getElementById('collectorStatusTag');
  const collectorActionArea = document.getElementById('collectorActionArea');
  const sellerStatusTag = document.getElementById('sellerStatusTag');

  if (cStep2) cStep2.className = 'step-node completed';
  if (cStep3) cStep3.className = 'step-node current';
  if (collectorStatusTag) {
    collectorStatusTag.innerText = 'Arrived';
    collectorStatusTag.className = 'status-tag active';
  }

  if (collectorActionArea) {
    collectorActionArea.innerHTML = `
      <button class="btn btn-primary" onclick="sendReceiveOtp()">
        ✉ Send Receive OTP to Seller
      </button>
    `;
  }

  // Update Seller status
  if (sellerStatusTag) {
    sellerStatusTag.innerText = 'Collector Arrived';
    sellerStatusTag.className = 'status-tag active';
  }

  showToast('Collector reached location. Ready to send Receive OTP.');
}

function generateNewOtp() {
  currentOtp = String(Math.floor(1000 + Math.random() * 9000));
  const d1 = document.getElementById('cDigit1');
  const d2 = document.getElementById('cDigit2');
  const d3 = document.getElementById('cDigit3');
  const d4 = document.getElementById('cDigit4');

  if (d1) d1.innerText = currentOtp[0];
  if (d2) d2.innerText = currentOtp[1];
  if (d3) d3.innerText = currentOtp[2];
  if (d4) d4.innerText = currentOtp[3];

  showToast(`New Receive OTP ${currentOtp} generated & dispatched.`);
}

function sendReceiveOtp() {
  generateNewOtp();
  const collectorActionArea = document.getElementById('collectorActionArea');
  const collectorOtpArea = document.getElementById('collectorOtpArea');
  const sellerWaitingArea = document.getElementById('sellerWaitingArea');
  const sellerOtpArea = document.getElementById('sellerOtpArea');
  const sellerStatusTag = document.getElementById('sellerStatusTag');

  if (collectorActionArea) collectorActionArea.style.display = 'none';
  if (collectorOtpArea) collectorOtpArea.style.display = 'block';
  
  // Prompt Seller on their screen
  if (sellerWaitingArea) sellerWaitingArea.style.display = 'none';
  if (sellerOtpArea) sellerOtpArea.style.display = 'block';
  if (sellerStatusTag) sellerStatusTag.innerText = 'OTP Verification';

  showToast(`Receive OTP ${currentOtp} sent to seller.`);
}

function autofillSellerOtp() {
  const sellerOtpInput = document.getElementById('sellerOtpInput');
  if (sellerOtpInput) {
    sellerOtpInput.value = currentOtp;
    showToast(`Autofilled OTP: ${currentOtp}`);
  }
}

function sellerVerifyOtp() {
  const sellerOtpInput = document.getElementById('sellerOtpInput');
  const entered = sellerOtpInput ? sellerOtpInput.value.trim() : '';

  if (!entered || entered.length !== 4) {
    showToast('Please enter the 4-digit Receive OTP.');
    return;
  }

  if (entered !== currentOtp && entered !== '7842') {
    showToast('Invalid OTP. Please check the code provided by collector.');
    return;
  }

  // Release Escrow Payout
  walletBalance += 4500;
  const headerWallet = document.getElementById('headerWallet');
  if (headerWallet) headerWallet.innerText = `₹${walletBalance.toLocaleString('en-IN')}`;

  // Update Seller Screen
  const sellerOtpArea = document.getElementById('sellerOtpArea');
  const sellerCompleteArea = document.getElementById('sellerCompleteArea');
  const sellerStatusTag = document.getElementById('sellerStatusTag');

  if (sellerOtpArea) sellerOtpArea.style.display = 'none';
  if (sellerCompleteArea) sellerCompleteArea.style.display = 'block';
  if (sellerStatusTag) {
    sellerStatusTag.innerText = 'Completed & Paid';
    sellerStatusTag.className = 'status-tag success';
  }

  // Update Collector Screen
  const cStep3 = document.getElementById('cStep3');
  const cStep4 = document.getElementById('cStep4');
  const collectorOtpArea = document.getElementById('collectorOtpArea');
  const collectorCompleteArea = document.getElementById('collectorCompleteArea');
  const collectorStatusTag = document.getElementById('collectorStatusTag');

  if (cStep3) cStep3.className = 'step-node completed';
  if (cStep4) cStep4.className = 'step-node completed';
  if (collectorOtpArea) collectorOtpArea.style.display = 'none';
  if (collectorCompleteArea) collectorCompleteArea.style.display = 'block';
  if (collectorStatusTag) {
    collectorStatusTag.innerText = 'Handover Verified';
    collectorStatusTag.className = 'status-tag success';
  }

  // Open Celebratory Modal
  const payoutModal = document.getElementById('payoutModal');
  if (payoutModal) payoutModal.classList.add('open');

  showToast('🎉 Handover authenticated! ₹4,500 credited to seller.');
}

function closeModal() {
  const payoutModal = document.getElementById('payoutModal');
  if (payoutModal) payoutModal.classList.remove('open');
}

function resetDemo() {
  walletBalance = 0;
  currentOtp = '7842';
  const headerWallet = document.getElementById('headerWallet');
  if (headerWallet) headerWallet.innerText = '₹0';
  
  const cStep1 = document.getElementById('cStep1');
  const cStep2 = document.getElementById('cStep2');
  const cStep3 = document.getElementById('cStep3');
  const cStep4 = document.getElementById('cStep4');

  if (cStep1) cStep1.className = 'step-node completed';
  if (cStep2) cStep2.className = 'step-node current';
  if (cStep3) cStep3.className = 'step-node';
  if (cStep4) cStep4.className = 'step-node';

  const collectorStatusTag = document.getElementById('collectorStatusTag');
  const collectorActionArea = document.getElementById('collectorActionArea');
  const collectorOtpArea = document.getElementById('collectorOtpArea');
  const collectorCompleteArea = document.getElementById('collectorCompleteArea');

  if (collectorStatusTag) {
    collectorStatusTag.innerText = 'On the way';
    collectorStatusTag.className = 'status-tag active';
  }
  if (collectorActionArea) {
    collectorActionArea.style.display = 'block';
    collectorActionArea.innerHTML = `
      <button class="btn btn-primary" onclick="collectorArrive()">
        📍 I Have Arrived at Seller Doorstep
      </button>
    `;
  }
  if (collectorOtpArea) collectorOtpArea.style.display = 'none';
  if (collectorCompleteArea) collectorCompleteArea.style.display = 'none';

  const sellerStatusTag = document.getElementById('sellerStatusTag');
  const sellerWaitingArea = document.getElementById('sellerWaitingArea');
  const sellerOtpArea = document.getElementById('sellerOtpArea');
  const sellerCompleteArea = document.getElementById('sellerCompleteArea');
  const sellerOtpInput = document.getElementById('sellerOtpInput');

  if (sellerStatusTag) {
    sellerStatusTag.innerText = 'Waiting for arrival';
    sellerStatusTag.className = 'status-tag';
  }
  if (sellerWaitingArea) sellerWaitingArea.style.display = 'block';
  if (sellerOtpArea) sellerOtpArea.style.display = 'none';
  if (sellerCompleteArea) sellerCompleteArea.style.display = 'none';
  if (sellerOtpInput) sellerOtpInput.value = '';

  showToast('Demo state reset to beginning.');
}

// Window resize listener to keep grid responsive
window.addEventListener('resize', () => {
  const modeDual = document.getElementById('modeDual');
  const grid = document.getElementById('mainGrid');
  if (modeDual && modeDual.classList.contains('active') && grid) {
    grid.style.gridTemplateColumns = window.innerWidth > 920 ? '1fr 1fr' : '1fr';
  }
});
