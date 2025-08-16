import React from 'react';
import styles from './PoliticaPrivacidad.module.css';

const PoliticaPrivacidad: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Política de Privacidad</h1>
        
        <div className={styles.section}>
          <p className={styles.lastUpdated}>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className={styles.section}>
          <h2>1. Información General</h2>
          <p>
            Esential Barber ("nosotros", "nuestra", "nos") se compromete a proteger y respetar su privacidad. 
            Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información 
            personal cuando utiliza nuestra aplicación móvil y servicios relacionados.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Información que Recopilamos</h2>
          <h3>2.1 Información Personal</h3>
          <p>Podemos recopilar la siguiente información personal:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Información de perfil (preferencias de servicios, historial de citas)</li>
            <li>Información de pago (cuando aplique)</li>
          </ul>

          <h3>2.2 Información de Uso</h3>
          <p>También recopilamos información sobre cómo utiliza nuestra aplicación:</p>
          <ul>
            <li>Datos de uso de la aplicación</li>
            <li>Información del dispositivo</li>
            <li>Dirección IP</li>
            <li>Cookies y tecnologías similares</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>3. Cómo Utilizamos su Información</h2>
          <p>Utilizamos su información personal para:</p>
          <ul>
            <li>Procesar y gestionar sus citas</li>
            <li>Proporcionar servicios de atención al cliente</li>
            <li>Enviar confirmaciones y recordatorios de citas</li>
            <li>Mejorar nuestros servicios</li>
            <li>Cumplir con obligaciones legales</li>
            <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>4. Compartir Información</h2>
          <p>No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:</p>
          <ul>
            <li>Con proveedores de servicios que nos ayudan a operar nuestra aplicación</li>
            <li>Cuando sea requerido por ley</li>
            <li>Para proteger nuestros derechos y seguridad</li>
            <li>Con su consentimiento explícito</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>5. Seguridad de Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información 
            personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún 
            método de transmisión por internet o almacenamiento electrónico es 100% seguro.
          </p>
        </div>

        <div className={styles.section}>
          <h2>6. Retención de Datos</h2>
          <p>
            Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos 
            descritos en esta política, a menos que la ley requiera un período de retención más largo.
          </p>
        </div>

        <div className={styles.section}>
          <h2>7. Sus Derechos</h2>
          <p>Usted tiene los siguientes derechos respecto a su información personal:</p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
            <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
            <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos personales</li>
            <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
            <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
            <li><strong>Retiro del consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>8. Cookies y Tecnologías Similares</h2>
          <p>
            Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestra aplicación, 
            analizar el tráfico y personalizar el contenido. Puede controlar el uso de cookies a través 
            de la configuración de su navegador.
          </p>
        </div>

        <div className={styles.section}>
          <h2>9. Servicios de Terceros</h2>
          <p>
            Nuestra aplicación puede integrar servicios de terceros como Google Calendar para la gestión 
            de citas. Estos servicios tienen sus propias políticas de privacidad, y le recomendamos 
            revisarlas.
          </p>
        </div>

        <div className={styles.section}>
          <h2>10. Menores de Edad</h2>
          <p>
            Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente 
            información personal de menores de edad. Si cree que hemos recopilado información de un menor, 
            contáctenos inmediatamente.
          </p>
        </div>

        <div className={styles.section}>
          <h2>11. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cualquier 
            cambio significativo a través de nuestra aplicación o por correo electrónico.
          </p>
        </div>

        <div className={styles.section}>
          <h2>12. Contacto</h2>
          <p>
            Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos su información personal, 
            puede contactarnos en:
          </p>
          <div className={styles.contactInfo}>
            <p><strong>Email:</strong> elemenbarber@gmail.com</p>
            <p><strong>Dirección:</strong> Esential Barber</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2>13. Consentimiento</h2>
          <p>
            Al utilizar nuestra aplicación, usted acepta los términos de esta Política de Privacidad. 
            Si no está de acuerdo con esta política, por favor no utilice nuestros servicios.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;
