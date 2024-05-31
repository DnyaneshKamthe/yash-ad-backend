
const Candidate = require ("../models/candidate")
const addCandidate = async (req,res) => {
    const userId = req.user._id;
   try {
    const {
        cName,
        experience,
        email,
        number,
        education,
        skills,
        currCtc,
        expCtc,
        notice,
        relocate,
    } = req.body;

    const createdBy = userId

    const candidate = new Candidate({
        cName,
        experience,
        email,
        number,
        education,
        skills,
        currCtc,
        expCtc,
        notice,
        relocate,
        createdBy
    })

    await candidate.save()
    res.status(200).json({ status: 200, message: "Candidate added successfully" });
   } catch (error) {

    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
   }
}

const get_all_candidates = async (req, res)=> {
    const userId = req.user._id;
    let  allCandidates
    try {
        if(req.user.employeeRole === "Admin"){
            allCandidates = await Candidate.find()
        }else{
            allCandidates = await Candidate.find({createdBy : userId})
        }
      
    
       res.status(200).json({ status: 200, message: "Candidates fetched successfully", allCandidates : allCandidates });
         
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message:error.message });
      }
}

module.exports = { addCandidate, get_all_candidates}