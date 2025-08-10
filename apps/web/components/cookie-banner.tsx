'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const cookieConsent = localStorage.getItem('pcanalys-cookie-consent')
    if (!cookieConsent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('pcanalys-cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const rejectCookies = () => {
    localStorage.setItem('pcanalys-cookie-consent', 'rejected')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Cookie className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-2">Respect de votre vie privée</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Nous utilisons des cookies essentiels pour le fonctionnement du site. Aucune
                    donnée personnelle n'est collectée ou partagée avec des tiers.
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={acceptCookies} className="text-xs">
                      Accepter
                    </Button>
                    <Button size="sm" variant="outline" onClick={rejectCookies} className="text-xs">
                      Refuser
                    </Button>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={rejectCookies} className="p-1 h-auto">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
