<?php

namespace Acts\CamdramBundle\Entity;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr as Expr;

/**
 * ShowRepository
 *
 */
class ShowRepository extends EntityRepository
{

    public function getNumberInDateRange(\DateTime $start, \DateTime $end)
    {
        $qb = $this->createQueryBuilder('s')->select('COUNT(DISTINCT s.id)');
        $qb->innerJoin('ActsCamdramBundle:Performance', 'p',Expr\Join::WITH, $qb->expr()->andX(
                'p.show = s',
                $qb->expr()->andX('p.start_date <= :end', 'p.end_date >= :start')
            ))
            ->setParameter('start', $start)
            ->setParameter('end', $end);
        $result = $qb->getQuery()->getOneOrNullResult();
        return current($result);
    }

    public function findByTimePeriod(TimePeriod $period)
    {
        $qb = $this->createQueryBuilder('s');
        $qb->innerJoin('ActsCamdramBundle:Performance', 'p',Expr\Join::WITH, $qb->expr()->andX(
            'p.show = s',
            $qb->expr()->andX('p.start_date <= :end', 'p.end_date >= :start')
        ))
            ->setParameter('start', $period->getStartAt())
            ->setParameter('end', $period->getEndAt());
        return $qb->getQuery()->getResult();
    }

    public function findMostInterestingByTimePeriod(TimePeriod $period, $limit)
    {
        //For now, we define 'most interesting' as 'lasts the longest period of time'
        $qb = $this->createQueryBuilder('s');
        $qb->leftJoin('s.performances', 'p')
            ->where('p.start_date < :end')
            ->andWhere('p.end_date > :start')
            ->setParameter('start', $period->getStartAt())
            ->setParameter('end', $period->getEndAt())
            ->orderBy('s.end_at - s.start_at', 'DESC')
            ->setMaxResults($limit);
        return $qb->getQuery()->getResult();
    }

    public function getUpcomingByVenue(Venue $venue)
    {
        $query = $this->createQueryBuilder('s')
            ->where('s.end_at > CURRENT_TIMESTAMP()')
            ->andWhere('s.venue = :venue')
            ->orderBy('s.start_at', 'ASC')
            ->setParameter('venue', $venue)
            ->getQuery();
        return $query->getResult();
    }

    public function getUpcomingBySociety(Society $society)
    {
        $query = $this->createQueryBuilder('s')
            ->where('s.end_at > CURRENT_TIMESTAMP()')
            ->andWhere('s.society = :society')
            ->orderBy('s.start_at', 'ASC')
            ->setParameter('society', $society)
            ->getQuery();
        return $query->getResult();
    }

}