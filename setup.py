import os
from setuptools import setup, find_packages


setup(
    name='cloudplayer.radio',
    version='0.3.0.dev0',
    author='CloudPlayer',
    author_email='hello@cloud-player.io',
    url='https://cloud-player.io/radio',
    description='CloudPlayer Raspberry Radio',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    include_package_data=True,
    zip_safe=False,
    license='Apache-2.0',
    namespace_packages=['cloudplayer'],
    setup_requires=['setuptools_git'],
    install_requires=[
        'mock',
        'RPi.GPIO' if 'raspberrypi' in os.uname() else 'mock',
        'tornado',
        'luma.oled',
        'setuptools'
    ],
    extras_require={
        'test': [
            'codecov',
            'mock',
            'pylint',
            'pytest-cov',
            'pytest-pep8',
            'pytest-remove-stale-bytecode',
            'pytest-timeout',
            'pytest-tornado',
            'pytest'
        ]
    },
    entry_points={
        'console_scripts': [
            'radio=cloudplayer.radio.app:main',
            'pytest=pytest:main [test]',
            'test=pytest:main [test]'
        ]
    }
)
