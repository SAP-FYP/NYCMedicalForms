document.addEventListener('DOMContentLoaded', (event) => {
    var dropdownMenuStayOpen = document.querySelectorAll('.dropdown-menu-stay');
    const classDropDown = document.getElementById('classDropDown');
    const schoolDropDown = document.getElementById('schoolDropDown');
    const courseDateDropDown = document.getElementById('courseDateDropDown');
   
    // prevent menu from closing down 
    for (var i = 0; i < dropdownMenuStayOpen.length; i++) {
        dropdownMenuStayOpen[i].addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    document.getElementById('classMenuButton').addEventListener('click', function() {
        const limit = 7;
        let offset = 0;
        const classesDiv = document.getElementById('classesDiv');
        const searchBar = document.getElementById('classSearch');
    
        const fetchClasses = (searchTerm = '') => {
            fetch(`/getClasses?limit=${limit}&offset=${offset}&search=${searchTerm}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const loadingMsgDiv = classesDiv.querySelector('.loadingMsg');
                if(loadingMsgDiv){
                    loadingMsgDiv.remove();
                }
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.class;
                    li.className = "m-3";
                    classesDiv.appendChild(li);
                });
    
                // Increase the offset for the next fetch
                offset += limit;
                console.log(offset+'1')
                // If reached the end of data, remove any more scroll
                if (data.length < limit) {
                    document.getElementById('classDropDownMenu').removeEventListener('scroll', handleScroll);
                }
            })  
            .catch(error => console.error('Error:', error));
        };
    
        const handleScroll = (e) => {
            const nearBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;
            console.log(offset+'2')
            if (nearBottom) {
                console.log("aaaaaaaaaa")
                // Remove the scroll event listener to prevent multiple requests
                document.getElementById('classDropDownMenu').removeEventListener('scroll', handleScroll);
    
                // Fetch the next set of data
                fetchClasses();
            }
        };
    
        // Search event listener
        searchBar.addEventListener('input', function() {
            // Reset the offset and clear the classesDiv
            offset = 0;
            classesDiv.innerHTML = "";
            console.log(offset+'3')
            // Add the loading message
            const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
            classesDiv.appendChild(loadingMsgTemplate);
    
            // Fetch the new search results
            fetchClasses(searchBar.value.trim());
    
            // Reattach the scroll event listener
            document.getElementById('classDropDownMenu').addEventListener('scroll', handleScroll);
        });
        
        // when dropdown is closed
        classDropDown.addEventListener('hide.bs.dropdown',event => {
            const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
            const classesDiv = document.getElementById('classesDiv');
            searchBar.value = '';
            classesDiv.innerHTML = '';
            classesDiv.appendChild(loadingMsgTemplate);
            document.getElementById('classDropDownMenu').removeEventListener('scroll', handleScroll);
            offset = 0;
            console.log(offset);
        });

        // Fetch the first set of data
        fetchClasses();
        console.log(offset+'0')
        document.getElementById('classDropDownMenu').addEventListener('scroll', handleScroll);
    });
    
 
    document.getElementById('schoolMenuButton').addEventListener('click', function() {
        const limit = 7;
        let offset = 0;
        const schoolsDiv = document.getElementById('schoolsDiv');
        const searchBar = document.getElementById('schoolSearch');

        const fetchSchools = (searchTerm = '') => {
            fetch(`/getSchools?limit=${limit}&offset=${offset}&search=${searchTerm}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const loadingMsgDiv = schoolsDiv.querySelector('.loadingMsg');
                if(loadingMsgDiv){
                    loadingMsgDiv.remove();
                }
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.school;
                    li.className = "m-3";
                    schoolsDiv.appendChild(li);
                });
    
                // Increase the offset for the next fetch
                offset += limit;

                // Remove the loadingMsg div after the first fetch
                if (offset === limit) {
                    const schoolsLoadingMsg = document.querySelector('#schoolDropDown .loadingMsg');
                    if (schoolsLoadingMsg) {
                        schoolsLoadingMsg.remove();
                    }
                }
                
                // If reached the end of data, remove any more scroll
                if (data.length < limit) {
                    schoolsDiv.removeEventListener('scroll', handleScroll);
                }
            })
            .catch(error => console.error('Error:', error));
        };
    
        const handleScroll = (e) => {
            const nearBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;
            if (nearBottom) {
                // Remove the scroll event listener to prevent multiple requests
                schoolsDiv.removeEventListener('scroll', handleScroll);
    
                // Fetch the next set of data
                fetchSchools();
            }
            
        };
        
        // Search event listener
        searchBar.addEventListener('input', function() {
            offset = 0;
            schoolsDiv.innerHTML = "";
            
            // Add the loading message
            const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
            schoolsDiv.appendChild(loadingMsgTemplate);
    
            // Fetch the new search results
            fetchSchools(searchBar.value.trim());
    
            // Reattach the scroll event listener
            //schoolsDiv.addEventListener('scroll', handleScroll);
        });

        schoolDropDown.addEventListener('hidden.bs.dropdown',event =>{
            const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);;
            const schoolsDiv = document.getElementById('schoolsDiv');
            searchBar.value = '';
            schoolsDiv.innerHTML = "";
            schoolsDiv.appendChild(loadingMsgTemplate);
            document.getElementById('schoolDropDownMenu').removeEventListener('scroll', handleScroll);
            offset = 0;
            console.log(offset);
        });
        // Fetch the first set of data
        fetchSchools();
        document.getElementById('schoolDropDownMenu').addEventListener('scroll', handleScroll);
    });

    document.getElementById('courseDateMenuButton').addEventListener('click', function() {
        const limit = 7;
        let offset = 0;
        const courseDatesDiv = document.getElementById('courseDatesDiv');
        const searchBar = document.getElementById('courseDateSearch');

        const fetchCourseDates = (searchTerm='') => {
            fetch(`/getCourseDates?limit=${limit}&offset=${offset}&search=${searchTerm}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const loadingMsgDiv = courseDatesDiv.querySelector('.loadingMsg');
                if(loadingMsgDiv){
                    loadingMsgDiv.remove();
                }
                data.forEach(item => {
                    const li = document.createElement('li');
                    const courseDate = new Date(item.courseDate).toISOString().split('T')[0];
                    li.textContent = courseDate;
                    li.className = "m-3";
                    courseDatesDiv.appendChild(li);
                });
    
                // Increase the offset for the next fetch
                offset += limit;

                // Remove the loadingMsg div after the first fetch
                if (offset === limit) {
                    const courseDatesLoadingMsg = document.querySelector('#courseDateDropDown .loadingMsg');
                    if (courseDatesLoadingMsg) {
                    courseDatesLoadingMsg.remove();
                    }
                }
                
                // If reached the end of data, remove any more scroll
                if (data.length < limit) {
                    courseDatesDiv.removeEventListener('scroll', handleScroll);
                }
            })
            .catch(error => console.error('Error:', error));
        };
    
        const handleScroll = (e) => {
            const nearBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;
            if (nearBottom) {
                // Remove the scroll event listener to prevent multiple requests
                courseDatesDiv.removeEventListener('scroll', handleScroll);
    
                // Fetch the next set of data
                fetchCourseDates();
            }
        };
        // Search event listener
        searchBar.addEventListener('input', function() {
            offset = 0;
            courseDatesDiv.innerHTML = "";
            
            // Add the loading message
            const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
            courseDatesDiv.appendChild(loadingMsgTemplate);

            // Fetch the new search results
            fetchCourseDates(searchBar.value.trim());

            // Reattach the scroll event listener
            //courseDatesDiv.addEventListener('scroll', handleScroll);
        });

        courseDateDropDown.addEventListener('hidden.bs.dropdown',event =>{
            const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);;
            const courseDatesDiv = document.getElementById('courseDatesDiv');
            searchBar.value = '';
            courseDatesDiv.innerHTML = "";
            courseDatesDiv.appendChild(loadingMsgTemplate);
            document.getElementById('courseDateDropDownMenu').removeEventListener('scroll', handleScroll);
            offset = 0;
            console.log(offset);
        });
    
        // Fetch the first set of data
        fetchCourseDates();
        document.getElementById('courseDateDropDownMenu').addEventListener('scroll', handleScroll);
    });
});