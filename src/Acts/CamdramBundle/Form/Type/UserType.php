<?php

namespace Acts\CamdramBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * Class UserType
 *
 * The form that's presented when a user is edited
 *
 * @package Acts\CamdramBundle\Form\Type
 */
class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name')
            ->add('email')
            ->add('person', 'entity_search', array('required' => false, 'route' => 'get_people', 'class' => 'Acts\\CamdramBundle\\Entity\\Person'))
            ->add('occupation', 'occupation')
            ->add('graduation', 'graduation_year', array('required' => false))
        ;
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Acts\CamdramSecurityBundle\Entity\User'
        ));
    }

    public function getName()
    {
        return 'acts_camdrambundle_usertype';
    }
}
