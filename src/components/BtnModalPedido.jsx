import usePedido from "../hooks/usePedido"


const BtnModalPedido = () => {

    const { modalPedido, setModalPedido } = usePedido()

    return (
        <button 
        className="fixed z-10 bg-green-700 p-4 rounded-full left-2 bottom-3 xl:hidden"
        onClick={() => setModalPedido(!modalPedido)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12.684 3.27l.084 .09l4.7 5.64h3.532a1 1 0 0 1 .991 1.131l-.02 .112l-1.984 7.918c-.258 1.578 -1.41 2.781 -2.817 2.838l-.17 .001l-10.148 -.002c-1.37 -.053 -2.484 -1.157 -2.787 -2.57l-.035 -.185l-2 -8a1 1 0 0 1 .857 -1.237l.113 -.006h3.53l4.702 -5.64a1 1 0 0 1 1.452 -.09zm-.684 8.73a3 3 0 0 0 -2.98 2.65l-.015 .174l-.005 .176l.005 .176a3 3 0 1 0 2.995 -3.176zm0 -6.438l-2.865 3.438h5.73l-2.865 -3.438z" strokeWidth="0" fill="white"></path>
            </svg>
        </button>
    )
}

export default BtnModalPedido