  // Constants for A4 size
  const A4_WIDTH = 21;
  const A4_HEIGHT = 29.7;

  // DOM Elements
  const imageInput = document.getElementById('imageInput');
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');
  const copiesInput = document.getElementById('copiesInput');
  const printButton = document.getElementById('printButton');
  const downloadPdfButton = document.getElementById('downloadPdfButton');
  const downloadImageButton = document.getElementById('downloadImageButton');
  const clearButton = document.getElementById('clearButton');
  const previewArea = document.getElementById('previewArea');
  const printInfo = document.getElementById('printInfo');
  const previewPlaceholder = document.getElementById('previewPlaceholder');

  let selectedImage = null;

  // Event Listeners
  imageInput.addEventListener('change', handleImageUpload);
  widthInput.addEventListener('input', updateLayout);
  heightInput.addEventListener('input', updateLayout);
  copiesInput.addEventListener('input', updateLayout);
  printButton.addEventListener('click', () => window.print());
  clearButton.addEventListener('click', clearAll);
  downloadPdfButton.addEventListener('click', downloadAsPDF);
  downloadImageButton.addEventListener('click', downloadAsImage);

  function handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
              selectedImage = event.target.result;
              updateLayout();
              printButton.disabled = false;
              downloadPdfButton.disabled = false;
              downloadImageButton.disabled = false;
              clearButton.disabled = false;
              printInfo.classList.remove('hidden');
              previewPlaceholder.style.display = 'none';
          };
          reader.readAsDataURL(file);
      }
  }

  async function downloadAsPDF() {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'cm', [21, 29.7]);
      
      // Hide placeholder before capturing
      previewPlaceholder.style.display = 'none';
      
      const canvas = await html2canvas(previewArea, {
          scale: 2,
          useCORS: true,
          allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 21, 29.7);
      
      pdf.save('photo-layout.pdf');
  }

  async function downloadAsImage() {
      // Hide placeholder before capturing
      previewPlaceholder.style.display = 'none';
      
      const canvas = await html2canvas(previewArea, {
          scale: 2,
          useCORS: true,
          allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = 'photo-layout.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
  }

  function clearAll() {
      // Reset all inputs
      imageInput.value = '';
      widthInput.value = '5';
      heightInput.value = '5';
      copiesInput.value = '1';
      
      // Reset preview
      selectedImage = null;
      previewArea.innerHTML = '';
      previewPlaceholder.style.display = 'flex';
      
      // Reset UI states
      printButton.disabled = true;
      downloadPdfButton.disabled = true;
      downloadImageButton.disabled = true;
      clearButton.disabled = true;
      printInfo.classList.add('hidden');
      
      // Clear preview area
      while (previewArea.firstChild && previewArea.firstChild !== previewPlaceholder) {
          previewArea.removeChild(previewArea.firstChild);
      }
  }

  function updateLayout() {
      if (!selectedImage) return;

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);
      const copies = Number(copiesInput.value);

      // Calculate layout
      const photosPerRow = Math.floor(A4_WIDTH / width);
      const photosPerColumn = Math.floor(A4_HEIGHT / height);
      const photosPerPage = photosPerRow * photosPerColumn;
      const totalPages = Math.ceil(copies / photosPerPage);

      // Update display
      document.getElementById('photosPerRow').textContent = photosPerRow;
      document.getElementById('photosPerColumn').textContent = photosPerColumn;
      document.getElementById('photosPerPage').textContent = photosPerPage;
      document.getElementById('totalPages').textContent = totalPages;

      // Generate preview
      previewArea.innerHTML = '';
      for (let row = 0; row < photosPerColumn; row++) {
          for (let col = 0; col < photosPerRow; col++) {
              const photoDiv = document.createElement('div');
              photoDiv.className = 'absolute border border-gray-300';
              photoDiv.style.width = `${(width / A4_WIDTH) * 100}%`;
              photoDiv.style.height = `${(height / A4_HEIGHT) * 100}%`;
              photoDiv.style.left = `${(col * width / A4_WIDTH) * 100}%`;
              photoDiv.style.top = `${(row * height / A4_HEIGHT) * 100}%`;

              const img = document.createElement('img');
              img.src = selectedImage;
              img.className = 'w-full h-full object-cover';
              img.alt = 'Preview';

              photoDiv.appendChild(img);
              previewArea.appendChild(photoDiv);
          }
      }
  }

  // Styles for print view
  const printStyles = document.createElement('style');
  printStyles.textContent = `
      @media print {
          body * {
              visibility: hidden;
          }
          #previewArea, #previewArea * {
              visibility: visible;
          }
          #previewArea {
              position: fixed;
              left: 0;
              top: 0;
              width: 21cm;
              height: 29.7cm;
              margin: 0;
              padding: 0;
          }
          #previewPlaceholder {
              display: none !important;
          }
      }
  `;
  document.head.appendChild(printStyles);