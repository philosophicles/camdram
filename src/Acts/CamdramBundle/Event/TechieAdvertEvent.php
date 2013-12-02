<?php
namespace Acts\CamdramBundle\Event;

use Acts\CamdramBundle\Entity\TechieAdvert;
use Symfony\Component\EventDispatcher\Event;

class TechieAdvertEvent extends Event
{
    private $techieAdvert;

    public function __construct(TechieAdvert $techieAdvert)
    {
        $this->techieAdvert = $techieAdvert;
    }

    public function getTechieAdvert()
    {
        return $this->techieAdvert;
    }

}