import { Form, Image } from 'react-bootstrap'
import schema1 from '../../assets/gallery/schema-1.png'
import schema2 from '../../assets/gallery/schema-2.png'
import schema3 from '../../assets/gallery/schema-3.png'
import '../auth/login.css'

function Gallery() {
  return (
    <div className="color-overlay d-flex justify-content-center align-items-center ">
      <div className="col-12 col-md-6 col-lg-5">
        <Form className="rounded p-4 p-sm-3 bg-dark">
          <div className="d-flex flex-wrap justify-content-between">
            <Image
              src={schema3}
              style={{ width: '200px', height: '200px' }}
            ></Image>
            <Image
              src={schema1}
              style={{ width: '200px', height: '200px' }}
            ></Image>
            <Image
              src={schema2}
              style={{ width: '200px', height: '200px' }}
            ></Image>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Gallery
