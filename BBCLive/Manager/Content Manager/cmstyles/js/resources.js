document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const uploadButton = document.getElementById('uploadButton');
    const closeButton = document.getElementById('closeButton');

    $(document).ready(function () {
        // Function to filter table rows based on search input
        $('#Search').on('input', function () {
            var searchText = $(this).val().toLowerCase();

            // Loop through each row in the table body
            $('#resourceTableBody tr').filter(function () {
                // Hide rows that do not match the search input
                $(this).toggle($(this).text().toLowerCase().indexOf(searchText) > -1);
            });
        });
    });
    
    // Handle file input change
    fileInput.addEventListener('change', function (e) {
        handleFiles(e.target.files);
    });
    
    // Handle drag and drop
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.classList.add('dragover');
        dropArea.style.backgroundColor = '#375BE8';
    });
    
    dropArea.addEventListener('dragleave', function () {
        dropArea.classList.remove('dragover');
        dropArea.style.backgroundColor = 'white';
    });
    
    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        const fileList = e.dataTransfer.files;
        
        if (fileList.length > 0) {
            fileInput.files = fileList;
            handleFiles(fileList);
        }
    });
    
    // Handle close button click
    closeButton.addEventListener('click', function () {
        closeModal();
        displayFileList([]);
        fileInput.value = '';
    });
    
    // Handle clicks outside the modal
    $('#exampleModal').on('hide.bs.modal', function () {
        displayFileList([]); 
        fileInput.value = '';
    });
    
    // Handle files (common function for both file input and drag-and-drop)
    function handleFiles(files) {
        displayFileList(files);
    }
    
    // Display selected files in the list
    function displayFileList(files) {
        const fileListContainer = document.getElementById('fileList');
        fileListContainer.innerHTML = '';
        
        for (const file of files) {
            const fileDiv = document.createElement('div');
            fileDiv.textContent = file.name;
            fileListContainer.appendChild(fileDiv);
        }
    }
    
    // Handle upload button click
    uploadButton.addEventListener('click', function () {
        const fileList = fileInput.files;
        
        if (fileList.length === 0) {
            alert('Please select files to upload.');
            return;
        }
        
        const formData = new FormData();
        
        for (let i = 0; i < fileList.length; i++) {
            formData.append('file', fileList[i]);
        }
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                alert('Files uploaded successfully!');
                closeModal();
                fetchResources(); // Fetch and update the resource table
                
                displayFileList([]);
            } else if (xhr.status === 409) {
                // Handle duplicate file response
                const response = JSON.parse(xhr.responseText);
                const confirmUpload = confirm(`A file with the name "${response.filename}" already exists. Do you want to upload it again?`);
                
                if (confirmUpload) {
                    // User confirmed to upload duplicate file
                    uploadDuplicateFile(response.filename, formData);
                } else {
                    // User chose not to upload duplicate file
                    alert('Duplicate file not uploaded.');
                }
            } else {
                alert('Error uploading files. Please try again.\nStatus: ' + xhr.status + '\nResponse: ' + xhr.responseText);
                console.error('Upload error:', xhr.statusText);
            }
        };
        xhr.onerror = function () {
            alert('Network error. Please try again.');
            console.error('Network error during upload');
        };
        xhr.send(formData);
        displayFileList([]);
        fileInput.value = '';
    });
    
    // Close the modal
    function closeModal() {
        const modal = document.getElementById('exampleModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        const modalBackdrops = document.getElementsByClassName('modal-backdrop');
        for (let i = 0; i < modalBackdrops.length; i++) {
            modalBackdrops[i].parentNode.removeChild(modalBackdrops[i]);
        }
    }
    
    // Fetch resources from the server and update the table
    function fetchResources() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/resources', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                updateResourceTable(data);
            } else {
                console.error('Fetch error:', xhr.statusText);
            }
        };
        xhr.onerror = function () {
            console.error('Network error during fetch');
        };
        xhr.send();
    }
    
    // Update the resource table with the fetched data
    function updateResourceTable(data) {
        const resourceTableBody = document.getElementById('resourceTableBody');
        resourceTableBody.innerHTML = '';
        
        for (const resource of data) {
            const row = document.createElement('tr');
            
            // Get the date components
            const dateObject = new Date(resource.dateuploaded);
            const year = dateObject.getFullYear();
            const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObject.getDate().toString().padStart(2, '0');
            
            // Format the date as "YYYY-MM-DD"
            const formattedDate = `${year}-${month}-${day}`;

            row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${resource.filename}</td>
            <td>${resource.type}</td>
            `;
            resourceTableBody.appendChild(row);
        }
    }
    
    // Initial fetch of resources when the page loads
    fetchResources();
});
