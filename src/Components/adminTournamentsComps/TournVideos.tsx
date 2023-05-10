import React, {useState} from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrash, faPlus, faVideo } from "@fortawesome/free-solid-svg-icons"; 
import { Tournament, Team } from "../../types/types"

interface TournVideosProps {
    tournInReview: Tournament, 
    setTournInReview: React.Dispatch<React.SetStateAction<Tournament>>
}

export default function TournVideos(props:TournVideosProps) {
    const tournInReview = props.tournInReview; 
    const setTournInReview = props.setTournInReview; 

    let [showUrlInput, setShowUrlInput] = useState(false); 
    let [newUrl, setNewUrl] = useState(""); 


    function handleLinkTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setNewUrl(e.target.value)
    }

    function addVideoLink(){
        if(!newUrl.toLowerCase().includes('youtube')){
            setNewUrl(''); 
            return; 
        }
        let urls = tournInReview.urls && tournInReview.urls.length ? tournInReview.urls : []; 
        setTournInReview({
            ...tournInReview, 
            urls: [...urls, newUrl]
        })
        setNewUrl(""); 
        setShowUrlInput(false);
    }

    function removeVideoLink(index:number){
        let urls = tournInReview.urls;  
        urls = urls.filter((el, ind) => ind != index ); 
        setTournInReview({
            ...tournInReview, 
            urls: [...urls]
        })
    }



    return (
        <div className="col-6 d-flex flex-column align-items-center">
            <div>Tourn Videos <FontAwesomeIcon className="mx-2" icon={faPlus} onClick={() => setShowUrlInput(true)} /> </div>
            {tournInReview.urls.map((el, ind) => {
                return (
                    <div className="my-1" key={ind}>
                        <a href={el}><FontAwesomeIcon icon={faVideo} size='sm' className="mx-2"/></a>
                        <FontAwesomeIcon icon={faTrash} size='sm' onClick={() => removeVideoLink(ind)} className="mx-2"/>

                    </div>)
            })}
            {showUrlInput ? <div className="d-flex justify-content-around align-items-center mt-2">
                    <input className="w-50" id='newUrl' name='newUrl' value={newUrl} onChange={handleLinkTextInput} placeholder="Add video url here"/>
                    <FontAwesomeIcon icon={faPlus} size='sm' onClick={addVideoLink} className="mx-2"/>
                </div> : <></>}
        </div>

    )
}
