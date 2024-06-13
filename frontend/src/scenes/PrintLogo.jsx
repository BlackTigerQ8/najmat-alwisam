import Logo from "../assets/nj-logo.png";
import styles from './Print.module.css'

export function PrintLogo(){
    
    return <div className={styles.logo}><img  src={Logo} width={300} alt="" /></div>
}