ÍNDEX:

- [BACKEND:](#backend)
  - [Login:](#login)
  - [Admin:](#admin)


# BACKEND: 


## Login:



## Admin:



* Llistat de productes


    * Llistar families de productes [OK]

/**
 * Retorna un JSON amb un llistat de totes les families de productes
 *
 * @route GET /list-product-families/:includeDisabled
 * @group ProductFamilies
 * @param {boolean} includeDisabled Indica si s'han d'incloure els productes inhabilitats. Passa 'true' per true, 'false' per false.
 * @returns {JSON} 200 - Llistat JSON amb una combinació
 * @returns {Error} 500 - Error de servidor o de base de dades.
 */
Exemple de retorn:

{"result": 0, "data":[
    {"jsonPF": [
        {
            "PF_Name": "Begudes destilades",
            "PF_AgeLimit": 21,
            "PF_Disabled": 0,
            "PF_IdFamily": 1,
            "PF_Description": "Productes alcoholics destilats"
        }, ...
        ]}
	]
}

