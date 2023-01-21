
export const niceTime = function(time:number | string, blank = "--"):string {    
    if(String(time).toUpperCase() == "NULL") return blank; 
    if(String(time).toUpperCase() == "NA") return blank; 
    if(String(time).toUpperCase() == "OT") return "OT"; 
    if(String(time).toUpperCase() == "NT") return "NT"; 
    if(String(time).toUpperCase() == "DQ") return "DQ"; 
    let newTime = ''; 
    newTime += time; 
    if(!newTime.includes('.')) newTime += '.00'; 
    let newTimeArr = newTime.split('.'); 
    if(newTimeArr[newTimeArr.length-1].length == 1) newTime += '0'
    return newTime; 
}
