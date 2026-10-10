const cl = console.log;

const postForm = document.getElementById('postForm')
const userId = document.getElementById('userId')
const title = document.getElementById('title')
const body = document.getElementById('body')
const submitBtn = document.getElementById('submitBtn')
const updateBtn = document.getElementById('updateBtn')
const postList = document.getElementById('postList')
const spinner = document.getElementById('spinner')

const BASE_URL ='https://student-crud-26d0f-default-rtdb.firebaseio.com/1st%20post%20crud%20fetch%20promise%20wog%20'
const POST_URL = `${BASE_URL}posts.json`

function snackbar(msg, icon){
    if(typeof Swal!== 'undefined'){
        Swal.fire({ title: msg, icon: icon, timer: 2000 })
    }else{
        alert(msg)
    }
}

function showSpinner(){ spinner.classList.remove('d-none') }
function hideSpinner(){ spinner.classList.add('d-none') }

const state = { postArr: [], editId: null }

//read
function onCreatePost(arr){
    let result = ``;
    arr.forEach(post=>{
        result += `
            <tr id="${post.id}">
                <td>${post.userId}</td>
                <td>${post.title}</td>
                <td>${post.body}</td>
                <td><button onclick="editPost(this)" class="btn btn-sm btn-warning">Edit</button></td>
                <td><button onclick="deletePost(this)" class="btn btn-sm btn-danger">Delete</button></td>
            </tr>`
    })
    postList.innerHTML = result;
}

function fetchPost(){
    showSpinner()
    fetch(POST_URL,{ method:"GET", headers:{ "Content-type":"application/json" }})
 .then(res=>{ if(!res.ok) throw new Error(); return res.json() })
 .then(data=>{
        if(data){
            for(const key in data){ data[key].id = key; state.postArr.unshift(data[key]) }
            onCreatePost(state.postArr)
        }
    })
 .catch(err=>cl(err))
 .finally(()=>hideSpinner())
}
fetchPost()

//create
function onPostAdd(eve){
    eve.preventDefault()
    let postObj = {
        userId: userId.value,
        title: title.value,
        body: body.value
    }
    if(!postObj.userId ||!postObj.title ||!postObj.body) return snackbar('Fill form properly','warning')

    showSpinner()
    fetch(POST_URL,{ method:"POST", body:JSON.stringify(postObj), headers:{ "Content-type":"application/json" }})
 .then(res=>res.json())
 .then(data=>{
        postObj.id = data.name
        state.postArr.unshift(postObj)

        let tr = document.createElement('tr')
        tr.id = postObj.id
        tr.innerHTML = `
                <td>${postObj.userId}</td>
                <td>${postObj.title}</td>
                <td>${postObj.body}</td>
                <td><button onclick="editPost(this)" class="btn btn-sm btn-warning">Edit</button></td>
                <td><button onclick="deletePost(this)" class="btn btn-sm btn-danger">Delete</button></td>
            `
        postList.prepend(tr)
        postForm.reset()
        snackbar('Post added','success')
    })
 .catch(err=>cl(err))
 .finally(()=>hideSpinner())
}

//delete
function deletePost(ele){
    let REMOVE_ID = ele.closest('tr').id
    let REMOVE_URL = `${BASE_URL}posts/${REMOVE_ID}.json`

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this post!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    }).then((result) => {
        if (result.isConfirmed) {
            showSpinner()
            fetch(REMOVE_URL, { method: "DELETE" })
           .then(res => {
                if(!res.ok) throw new Error('Failed to delete')
                return res.json()
            })
           .then(() => {
                state.postArr = state.postArr.filter(p => p.id!== REMOVE_ID);
                ele.closest('tr').remove();
                snackbar('Post deleted successfully!', 'success')
            })
           .catch(err => {
                cl(err)
                snackbar('Failed to delete', 'error')
            })
           .finally(() => hideSpinner())
        }
    })
}

//edit
function editPost(ele){
    let editId = ele.closest('tr').id
    state.editId = editId
    let EDIT_URL = `${BASE_URL}posts/${editId}.json`
    showSpinner()
    fetch(EDIT_URL)
 .then(res=>res.json())
 .then(data=>{
        userId.value = data.userId
        title.value = data.title
        body.value = data.body
        submitBtn.classList.add('d-none')
        updateBtn.classList.remove('d-none')
    })
 .catch(err=>cl(err))
 .finally(()=>hideSpinner())
}

//update
function onUpdatePost(eve){
    if(eve) eve.preventDefault()
    let update_Id = state.editId
    let UPDATE_URL = `${BASE_URL}posts/${update_Id}.json`
    let updateObj = {
        userId: userId.value,
        title: title.value,
        body: body.value,
        id: update_Id
    }

    showSpinner()
    fetch(UPDATE_URL,{ method:"PATCH", body:JSON.stringify(updateObj), headers:{ "Content-type":"application/json" }})
 .then(()=>{
        let getIndex = state.postArr.findIndex(p=>p.id === update_Id)
        state.postArr[getIndex] = updateObj
        let tr = document.getElementById(update_Id)

        tr.innerHTML = `
            <td>${updateObj.userId}</td>
            <td>${updateObj.title}</td>
            <td>${updateObj.body}</td>
            <td><button onclick="editPost(this)" class="btn btn-sm btn-warning">Edit</button></td>
            <td><button onclick="deletePost(this)" class="btn btn-sm btn-danger">Delete</button></td>
        `
        postForm.reset()
        submitBtn.classList.remove('d-none')
        updateBtn.classList.add('d-none')
        snackbar('Updated','success')
    })
 .catch(err=>cl(err))
 .finally(()=>hideSpinner())
}

postForm.addEventListener('submit', onPostAdd)
updateBtn.addEventListener('click', onUpdatePost)