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
            Elemen Barber ("nosotros", "nuestra", "nos") se compromete a proteger y respetar su privacidad. 
            Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información 
            personal cuando utiliza nuestra aplicación web y servicios relacionados.
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
            <li>Datos de uso de la aplicación (funciones utilizadas, frecuencia de uso)</li>
            <li>Información del dispositivo (tipo de dispositivo, sistema operativo)</li>
            <li>Dirección IP (para seguridad y análisis)</li>
            <li>Datos de sesión (para mantener su sesión activa)</li>
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
            <h2>8. Almacenamiento Local y Sesiones</h2>
            <p>
              Nuestra aplicación utiliza almacenamiento local del navegador para mantener su sesión activa 
              y recordar sus preferencias. Esta información se almacena únicamente en su dispositivo y no 
              se comparte con terceros. Puede eliminar estos datos en cualquier momento desde la configuración 
              de su navegador.
            </p>
          </div>

                  <div className={styles.section}>
            <h2>9. Servicios de Terceros</h2>
            <p>
              Nuestra aplicación integra los siguientes servicios de terceros:
            </p>
            <ul>
              <li><strong>Google Sign-In:</strong> Para la autenticación de usuarios</li>
              <li><strong>Google Calendar:</strong> Para la gestión y sincronización de citas</li>
              <li><strong>Servicios de hosting:</strong> Para almacenar y procesar datos de forma segura</li>
            </ul>
            <p>
              Estos servicios tienen sus propias políticas de privacidad, y le recomendamos revisarlas.
            </p>
          </div>

                  <div className={styles.section}>
            <h2>10. Menores de Edad</h2>
            <p>
              Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente 
              información personal de menores de edad. Si cree que hemos recopilado información de un menor, 
              contáctenos inmediatamente para proceder con su eliminación.
            </p>
          </div>

                  <div className={styles.section}>
            <h2>11. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cualquier 
              cambio significativo a través de nuestra aplicación web o por correo electrónico. 
              La fecha de última actualización se muestra al inicio de esta política.
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
            <p><strong>Aplicación:</strong> Elemen Barber</p>
          </div>
        </div>

                  <div className={styles.section}>
            <h2>13. Consentimiento</h2>
            <p>
              Al utilizar nuestra aplicación web, usted acepta los términos de esta Política de Privacidad. 
              Si no está de acuerdo con esta política, por favor no utilice nuestros servicios.
            </p>
          </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;
