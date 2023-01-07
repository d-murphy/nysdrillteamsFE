import * as React from "react";
import { useState, useEffect} from "react";
import { useLoginContext } from "../utils/context";
import { fetchGet, fetchPost } from "../utils/network"; 
import { User } from '../types/types'
import { capFirst } from "../utils/strings";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrash } from "@fortawesome/free-solid-svg-icons"; 


declare var SERVICE_URL: string;

interface AdminUsersProps {}

export default function AdminUpdates(props:AdminUsersProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false); 
    const [isError, setIsError] = useState(false); 
    const [reqSubmitted, setReqSubmitted] = useState(false); 
    const [formValid, setFormValid] = useState(false); 
    const [userInReview, setUserInReview] = useState<{username:string, role:string, password?:string, _id?:string}>({username:'', role: '', password:''})
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 

    const { sessionId, role  } = useLoginContext(); 

    const isAdmin = role === "admin"; 

    async function getUsers(){
        if(!sessionId) return 
        const url = `${SERVICE_URL}/users/getUsers`
        fetchGet(url, sessionId)
        .then(data => data.json())
        .then(data => {
            setUsers(data)
        })
        .catch(e => {
            console.log(e)
            setIsError(true)
        })
    }

    useEffect(() => {
        getUsers()
    }, [sessionId])

    function cleanNewUserModal(){
        setFormValid(false); 
        setReqSubmitted(false)
        setUserInReview({...{username:'', role: '', password: generatePassword()}})
        setReqResult({error: false, message: ""}); 
    }

    function cleanDeleteModal(){
        setReqSubmitted(false)
        setReqResult({error: false, message: ""}); 
    }

    function handleUsernameChange(e:React.ChangeEvent<HTMLInputElement>){
        let usersWUsername = users.filter(el => {
            return el.username == e.target.value; 
        })
        if(usersWUsername.length){
            setReqResult({error: true, message: "Username not available."}); 
            setFormValid(false)
        } else {
            setReqResult({error: false, message: ""}); 
            setFormValid(true); 
        }
        setUserInReview({
            ...userInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setUserInReview({
            ...userInReview, 
            [e.target.id]: e.target.value
        })
    }

    async function addUser(){
        if(!userInReview.username.length || !userInReview.role.length){
            setReqResult({error: true, message: "Username and role required."}); 
            return; 
        }
        setReqSubmitted(true); 
        let url = `${SERVICE_URL}/users/insertUser`
        let body = {
            username: userInReview.username, 
            password: userInReview.password, 
            role: userInReview.role
        }
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            getUsers();
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
        }
    }

    async function deleteUser(){
        setReqSubmitted(true); 
        let body = {userId: userInReview._id}; 
        let url = `${SERVICE_URL}/users/deleteUser`
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Deletion successful."}); 
            getUsers(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
        }
    }

    return (
        <div className="container">
            { isError ? 
                <div className="row">
                    <div className="col-12 d-flex flex-column align-items-center mt-5">
                        <div className="">Sorry, there was an error loading users.</div>
                    </div>
                </div> : <></>
            }
            { loading ? 
                <div className="row">
                    <div className="col-12 d-flex flex-column align-items-center mt-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                </div> : <></>                    
            }
            { !loading && !isError ? 

                <>

                    <div className="d-flex flex-column align-items-center justify-content-center">

                        <div 
                            className="btn add-entry-button my-5" 
                            data-bs-toggle="modal" 
                            data-bs-target="#newUserModal"
                            onClick={()=>{
                                cleanNewUserModal(); 
                            }}>Create User
                        </div>

                        <div className="w-100 mx-5 rounded bg-light py-4 mb-2">
                            <div className="row my-1">
                                <div className="col-5">
                                    <div className="test-center d-flex justify-content-center align-items-center ">
                                        <div className="font-large">Username
                                        </div>
                                    </div>
                                </div>
                                <div className="col-5">
                                    <div className="test-center d-flex justify-content-center align-items-center ">
                                            <div className="font-large">Role
                                            </div>
                                    </div>
                                </div>
                                <div className="col-2"></div>
                            </div>

                            {
                                users.map((user, ind) => {
                                    return (
                                        <div className="row my-1">
                                            <div className="col-5">
                                                <div className="test-center d-flex justify-content-center align-items-center ">
                                                        <div className="font-large">{user.username}
                                                        </div>
                                                </div>
                                            </div>
                                            <div className="col-5">
                                                <div className="test-center d-flex justify-content-center align-items-center ">
                                                        <div className="font-large">{capFirst(user.role)}
                                                        </div>
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                {user.role != 'admin' ? 
                                                    <div className="pointer px-3"
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#deleteUserModal"
                                                    onClick={()=>{
                                                        cleanDeleteModal(); 
                                                        setUserInReview({...user}); 
                                                    }}
                                                    ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                                    </div> : <></>
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    <div className="modal fade" id="newUserModal" aria-labelledby="newUserModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-l">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="newUserModalLabel">New User</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row my-1">
                                    <div className="col-4 text-center">Username</div>
                                    <div className="col-8 text-center px-4">
                                        <input 
                                            onChange={(e) => handleUsernameChange(e)} 
                                            id="username" 
                                            value={userInReview.username} 
                                            className="text-center width-100" 
                                            disabled={!isAdmin}
                                            autoComplete="off"></input>
                                    </div>
                                </div>
                                <div className="row my-1">
                                    <div className="col-4 text-center">Password</div>
                                    <div className="col-8 text-center px-4">
                                        <input 
                                            id="password" 
                                            value={userInReview.password} 
                                            className="text-center width-100" 
                                            disabled={true}
                                            autoComplete="off"></input>
                                    </div>
                                </div>
                                <div className="row my-1">
                                    <div className="col-4 text-center">Role</div>
                                    <div className="col-8 text-center px-4">
                                        <select onChange={handleSelect} id="role" name="role" className="width-100 text-center py-1" value={userInReview.role} disabled={!isAdmin}>
                                            <option value={null}></option>
                                            <option value={"scorekeeper"}>Scorekeeper</option>
                                            <option value={"video"}>Video Only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex flex-column">
                                <div className="text-center my-3">
                                    {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                        {reqResult.message}
                                    </span> : <></>}
                                    {!isAdmin ? <span>Only Admin can make changes.</span> : <></>}
                                </div>
                                <div className="">
                                    <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                    <button type="button" className="btn btn-primary mx-2" onClick={addUser} disabled={!isAdmin || !formValid || reqSubmitted}>Save changes</button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal fade" id="deleteUserModal" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-l">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="deleteUserModalLabel">Delete User?</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete {userInReview.username}?</p>
                                <p><i>Any DB changes made by the user are unaffected.</i></p>
                            </div>
                            <div className="modal-footer d-flex flex-column">
                                <div className="text-center my-3">
                                    {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                        {reqResult.message}
                                    </span> : <></>}
                                    {!isAdmin ? <span>Only Admin can make changes.</span> : <></>}
                                </div>
                                <div className="">
                                    <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                    <button type="button" className="btn btn-primary mx-2" onClick={deleteUser} disabled={!isAdmin || reqSubmitted}>Delete</button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                </> : <></>

            }

        </div>
    )
}

function generatePassword() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
