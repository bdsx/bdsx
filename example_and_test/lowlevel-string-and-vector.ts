import { CxxVector } from "bdsx/cxxvector";
import { CxxString } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";

// string allocation
const cxxstring = new CxxStringWrapper(true); // it will allocate memory if it takes 'true'. it points NULL without 'true'
cxxstring.construct(); // call the consturctor, std::string::string()
cxxstring.value = 'string'; // set value
cxxstring.resize(2);
console.assert(cxxstring.value == 'st');
cxxstring.destruct(); // call the destructor. std::string::~string()

// without true
const sampleStringInstance = new CxxStringWrapper;
// basically all native classes are the pointer
// it's the null pointer if you allocate without 'true' argument
console.assert(sampleStringInstance.toString() === '0x0000000000000000');


// vector allocation
const CxxVectorString = CxxVector.make(CxxString);
const cxxvector = CxxVectorString.construct(); // combination of 'new Class(true);' and 'cxxvector.construct();'
cxxvector.push('test');
console.assert(cxxvector.get(0) === 'test');
cxxvector.destruct(); // call std::vector<std::string>::~vector<string>()
