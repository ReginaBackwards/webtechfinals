    // Fetch resources from the server and update the table
    function fetchResources() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/editor', true);
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
        const resourceTableBody = document.getElementById('tablesContainer1');
        resourceTableBody.innerHTML = '';
        
        for (const resource of data) {
            const row = document.createElement('tr');

            row.innerHTML = `
            <tr>
            <td>${resource.filename}</td>
            <td>${resource.type}</td>
            </tr>
            `;
            resourceTableBody.appendChild(row);
        }
    }
    
    // Initial fetch of resources when the page loads
    fetchResources();