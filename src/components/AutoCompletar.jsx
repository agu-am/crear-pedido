import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import usePedido from '../hooks/usePedido'

const SearchAutoCompletar = () => {

    const { clientes, setBusquedaCliente, setClienteActual, setPedido } = usePedido()

    const handleOnSearch = (string, results) => {
        // onSearch will have as the first callback parameter
        // the string searched and for the second the results.
        console.log(string, results)
        setBusquedaCliente(string)
      }
    
      const handleOnHover = (result) => {
        // the item hovered
        console.log(result)
      }
    
      const handleOnSelect = (item) => {
        setPedido((prevPedido) => ({
          ...prevPedido, cliente: item
        }))
      }
    
      const handleOnFocus = () => {
        console.log('Focused')
      }
    
      const formatResult = (item) => {
        return (
          <>
            <span style={{ display: 'block', textAlign: 'center' }}>{item.name}</span>
          </>
        )
      }

    return (
        <div className='w-full py-2 px-2 flex flex-col justify-center self-center rounded-md'>
          <h2 className='font-bold uppercase'>Ingresar Cliente:</h2>
            <ReactSearchAutocomplete
                items={clientes}
                onSearch={handleOnSearch}
                onSelect={handleOnSelect}
                autoFocus
                formatResult={formatResult}
                showIcon={false}
                styling={{
                    height: "34px",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    boxShadow: "none",
                    fontSize: "12px",
                    placeholderColor: "darkgreen",
                    clearIconMargin: "3px 8px 0 0",
                    zIndex: 2,
                    fontWigth: "bold",
                  }}
            />
        </div>
    )
}

export default SearchAutoCompletar